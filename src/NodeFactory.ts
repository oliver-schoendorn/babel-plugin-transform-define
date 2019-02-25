import { Expression, ObjectProperty, Declaration } from 'babel-types'
import * as babelTypes from 'babel-types'
type Types = typeof babelTypes

class NodeFactory
{
    private readonly types: Types

    constructor(types: Types)
    {
        this.types = types
    }

    public expression = (value: any): Expression =>
    {
        const type = typeof value

        switch (true) {
            case value === undefined:   return this.types.identifier('undefined')
            case value === null:        return this.types.nullLiteral()
            case type === 'boolean':    return this.types.booleanLiteral(value)
            case type === 'number':     return this.types.numericLiteral(value)
            case type === 'string':     return this.types.stringLiteral(value)

            case value instanceof Array:
                return this.types.arrayExpression(value.map(this.expression))

            case value.toString() === '[object Object]':
                return this.types.objectExpression(
                    this.getObjectProperties(value)
                )

            default:
                throw new Error(
                    '[babel-plugin-transform-define]: Unable to create VariableDeclaration. ' +
                    'Expected a primitive, an array or an object, got "' + type + '".'
                )
        }
    }

    public declaration = (name: string, value: any, kind: 'var' | 'let' | 'const' = 'const'): Declaration =>
    {
        return this.types.variableDeclaration(kind, [
            this.types.variableDeclarator(
                this.types.identifier(name),
                this.expression(value)
            )
        ])
    }

    private getObjectProperties = (object: { [key in string]: any }): ObjectProperty[] =>
    {
        return Object.entries(object).reduce<ObjectProperty[]>((reducer, [ key, value ]) => {
            reducer.push(this.types.objectProperty(
                this.expression(key),
                this.expression(value),
            ))
            return reducer
        }, [])
    }
}

export { NodeFactory }
