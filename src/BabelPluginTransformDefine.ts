import { cwd } from 'process'
import { resolve as resolvePath} from 'path'
import { PluginObj } from 'babel-core'
import { NodePath, Visitor } from 'babel-traverse'
import { Identifier, IfStatement, MemberExpression, } from 'babel-types'
import * as babelTypes from 'babel-types'
import { defaultOptions, Options } from './Options'
import { NodeFactory } from './NodeFactory'

type Types = typeof babelTypes

class BabelPluginTransformDefine
{
    private readonly options: Options
    private readonly nodeFactory: NodeFactory
    private readonly replacementKeys: string[]

    public constructor(types: Types, options: Options)
    {
        this.nodeFactory = new NodeFactory(types)
        this.options = Object.assign({}, defaultOptions, options)

        if (this.options.file) {
            this.options.values = require(resolvePath(cwd(), this.options.file))
        }

        this.replacementKeys = Object.keys(this.options.values)
    }

    private log(message: string, ...any)
    {
        if (this.options.verbose) {
            console.info(message, ...any)
        }
    }

    public make(): PluginObj
    {
        const visitor: Visitor = this.makeVisitor('Identifier', this.process, {})

        if (this.options.memberExpressions) {
            this.makeVisitor('MemberExpression', this.processMemberExpression, visitor)
        }

        return {
            name: 'babel-plugin-transform-define',
            visitor
        }
    }

    private makeVisitor(type: keyof Visitor, visitor: (path, state) => void, map: Visitor): Visitor
    {
        const self = this
        return Object.assign(map, { [type]: function(path, state) {
            visitor.call(self, path, state)
        } })
    }

    private process(path: NodePath<Identifier>, state: any)
    {
        if (path.evaluate().value !== undefined || ! this.replacementKeys.includes(path.node.name)) {
            return
        }

        // If the parent path is an export specifier, insert a variable declaration above it and stop
        if (path.parentPath.isExportSpecifier() || path.parentPath.isExportDefaultDeclaration()) {
            if (! this.options.exportExpressions) {
                return
            }

            this.log('Processing export expression', { source: path.parentPath.getSource() })
            path.parentPath.insertBefore(this.nodeFactory.declaration(
                path.node.name,
                this.options.values[path.node.name]
            ))
            path.stop()
            return
        }

        if (path.isReferenced()) {
            this.log('Replacing Identifier', { source: path.parentPath.getSource() })
            path.replaceWith(this.nodeFactory.expression(this.options.values[path.node.name]))
        }

        if (this.options.evaluateConditionals) {
            this.evaluate(path.parentPath)
        }
    }

    private processMemberExpression(path: NodePath<MemberExpression>)
    {
        this.replacementKeys.forEach(key => {
            if (path.matchesPattern(key, false)) {
                path.replaceWith(this.nodeFactory.expression(this.options.values[key]))
            }
        })
    }

    private evaluate(path: NodePath)
    {
        const evaluation = path.evaluate()

        if (evaluation.confident !== true) {
            return
        }

        this.log('Evaluating', {
            type: path.type,
            source: path.parentPath.getSource()
        })

        if (path.parentPath.isIfStatement()) {
            return this.simplify(path.parentPath, evaluation.value)
        }

        path.replaceWith(this.nodeFactory.expression(evaluation.value))
        this.evaluate(path.parentPath as any)
    }

    private simplify(path: NodePath<IfStatement>, value: boolean)
    {
        const replacement = value
            ? path.node.consequent
            : path.node.alternate

        if (replacement) {
            path.replaceWith(replacement)
            return this.evaluate(path.parentPath)
        }

        path.remove()
    }
}

export { BabelPluginTransformDefine }
