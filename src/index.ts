import { PluginObj, types as Types, Visitor } from 'babel-core'
import { NodePath } from 'babel-traverse'
import { DeclarationFactory } from './DeclarationFactory'
import { DeclarationCache } from './DeclarationCache';

interface Arguments
{
    types: typeof Types
}


const debug = (node: NodePath) =>
{
    return {
        type: node.type,
        parentType: node.parentPath.type,
        parentParentType: node.parentPath.parentPath.type,
        isVariableDeclarator: node.parentPath.isVariableDeclarator(),
        isVariableDeclaration: node.parentPath.isVariableDeclaration(),
        variableDeclarations: node.parentPath.parentPath.isVariableDeclaration()
            ? node.parentPath.parentPath.node.declarations
            : null,
        isDeclareVariable: node.parentPath.isDeclareVariable(),
        isReferenced: node.isReferenced(),
        isIdentifier: node.isIdentifier(),
        isBindingIdentifier: node.isBindingIdentifier(),
        isReferencedIdentifier: node.isReferencedIdentifier(),
        isAssignmentPattern: node.isAssignmentPattern(),
        isParentAssignmentPattern: node.parentPath.isAssignmentPattern(),
        isAssignmentExpression: node.parentPath.isAssignmentExpression(),
        isExportSpecifier: node.isExportSpecifier(),
        isExportDeclaration: node.isExportDeclaration(),
        isExportDefaultDeclaration: node.isExportDefaultDeclaration()
    }
}

const makeTraverser = (state: any, declarationFactory: DeclarationFactory): Visitor =>
{
    const declarationCache = new DeclarationCache(declarationFactory, state.opts)
    return {
        Identifier(path, { opts }) {
            // path.shouldSkip = false
            if (! declarationCache.exists(path.node.name)) {
                return
            }

            if (opts._debug) {
                console.log({
                    traverse: 'TRAVERSER',
                    variable: path.node.name,
                    source: path.parentPath.getSource(),
                    parentSource: path.parentPath.parentPath.getSource(),
                    value: path.evaluate().value,
                    ...debug(path)
                })
            }

            // Todo: Refactor this (possibly with an iterator that walks up the node tree)
            if (path.parentPath.isBinaryExpression()) {
                path.replaceWith(declarationCache.get(path.node.name).value())
                const value = path.parentPath.evaluate()
                if (value.confident === true) {
                    path.parentPath.replaceWith(declarationFactory.makeValue(value.value))

                    if (path.parentPath.parentPath.isIfStatement()) {
                        const parentIf = path.parentPath.parentPath
                        const parentReplacement = value.value
                            ? parentIf.node.consequent
                            : parentIf.node.alternate

                        if (parentReplacement) {
                            parentIf.replaceWith(parentReplacement)
                        }
                        else {
                            parentIf.remove()
                        }
                    }
                }
                return
            }

            if (path.isExportNamedDeclaration() || path.parentPath.isExportNamedDeclaration()) {
                console.log('Maybe hit', {
                    source: path.parentPath.parentPath.getSource()
                })
            }

            if (path.parentPath.isExportSpecifier() && path.evaluate().value === undefined) {
                path.parentPath.insertBefore(declarationCache.get(path.node.name).declaration())
                path.stop()
                return
            }

            if (path.isReferenced() && path.evaluate().value === undefined) {
                path.replaceWith(declarationCache.get(path.node.name).value())
            }
        }
    }
}

const Plugin: ((babel: Arguments) => PluginObj) = function({ types })
{
    const declarationFactory = new DeclarationFactory(types)
    return {
        name: 'transform-define',
        visitor: {
            IfStatement(path, state) {
                path.traverse(makeTraverser(state, declarationFactory), state)
            },
            MemberExpression(path, state) {
                const declarationCache = new DeclarationCache(declarationFactory, state.opts)
                declarationCache.getKeys().forEach(key => {
                    if (path.matchesPattern(key) && path.evaluate().value === undefined) {
                        path.replaceWith(declarationCache.get(key).value())
                    }
                })
            },
            ExportSpecifier(path, state) {
                path.traverse(makeTraverser(state, declarationFactory), state)
            },
            ExpressionStatement(path, state) {
                path.traverse(makeTraverser(state, declarationFactory), state)
            },
            ExportDefaultDeclaration(path, state) {
                path.traverse(makeTraverser(state, declarationFactory), state)
            },
            VariableDeclaration(path, state) {
                path.traverse(makeTraverser(state, declarationFactory), state)
            }
        }
    }
}

module.exports = Plugin
