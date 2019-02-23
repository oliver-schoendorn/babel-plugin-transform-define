import { PluginObj, types as Types } from "babel-core"
import { NodePath } from "babel-traverse"

interface Arguments
{
    types: typeof Types
}

const isDeclaration = (path: NodePath): boolean =>
    path.parentPath.isVariableDeclarator() ||
    path.parentPath.parentPath.isVariableDeclarator() ||
    path.parentPath.isSpreadElement()


const debug = (node: NodePath) =>
{
    return {
        type: node.type,
        parentType: node.parentPath.type,
        parentParentType: node.parentPath.parentPath.type,
        isVariableDeclarator: node.parentPath.isVariableDeclarator(),
        isVariableDeclaration: node.parentPath.isVariableDeclaration(),
        isDeclareVariable: node.parentPath.isDeclareVariable(),
        isReferenced: node.isReferenced(),
        isIdentifier: node.isIdentifier(),
        isBindingIdentifier: node.isBindingIdentifier(),
        isReferencedIdentifier: node.isReferencedIdentifier(),
        isAssignmentPattern: node.isAssignmentPattern(),
        isParentAssignmentPattern: node.parentPath.isAssignmentPattern(),
        isAssignmentExpression: node.parentPath.isAssignmentExpression()
    }
}

interface PluginOptions
{
    [key: string]: any
}

let pluginOptions: object|null = null
let pluginOptionKeys: string[]|null = null
const pluginOptionsIncludeKey = (key: string|number, options: PluginOptions): key is keyof PluginOptions =>
{
    if (pluginOptions !== options) {
        pluginOptions = options
        pluginOptionKeys = Object.keys(options).filter(key => key !== '_debug')
    }

    return pluginOptionKeys.includes(key as string)
}


const Plugin: ((babel: Arguments) => PluginObj) = () =>
{
    return {
        name: 'transform-define',
        visitor: {
            AssignmentExpression(path) {
                console.log("Assignment: " + path.node.left.type + " / " + path.node.right.type)
            },
            Identifier(path, { opts }) {
                if (pluginOptionsIncludeKey(path.node.name, opts)) {
                    const replacement = pluginOptions[path.node.name]

                    if (opts._debug) {
                        console.log({
                            variable: path.node.name,
                            source: path.parentPath.getSource(),
                            value: path.evaluate().value,
                            ...debug(path)
                        })
                    }

                    if (isDeclaration(path) && path.isReferenced() && path.evaluate().value === undefined) {
                        path.replaceWithSourceString(JSON.stringify(replacement))
                        return
                    }
                }

                // if (testVars.test(path.node.name)) {
                //     console.log('==================')
                //
                //
                //     if (isDeclaration(path) && path.isIdentifier() && path.isReferenced()) {
                //         console.log({
                //             replace: path.parentPath.getSource(),
                //             self: path.getSource(),
                //             type: path.type,
                //             parentType: path.parentPath.type,
                //             parentParentType: path.parentPath.parentPath.type,
                //             parentParentParentType: path.parentPath.parentPath.parentPath.type,
                //             opts
                //         })
                //         return
                //     }
                //
                //     // else {
                //         console.log({
                //             source: path.parentPath.getSource(),
                //             self: debug(path),
                //             // parent: debug(path.parentPath)
                //         })
                //     // }
                //
                //
                //     // const parentPath = node
                //     // if (parentPath.isVariableDeclarator()) {
                //     //     console.log('What the?', path.parent.type)
                //     // }
                //     // node.isDeclaration()
                //     // console.log('DOOOOO STUFF: ' + node.type)
                //     // path.traverse(identify)
                // }
            },
            // Declaration(path) {
                // console.log('We have a declaration ' + path.node.type)
                // if (path.isVariableDeclaration()) {
                //     console.log(path.node.declarations)
                // }
            // }
        }
    }
}

module.exports = Plugin
