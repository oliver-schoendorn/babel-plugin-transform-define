import { types as babelTypes } from 'babel-core'
import { Expression, ObjectProperty, VariableDeclaration } from 'babel-types'

type Types = typeof babelTypes

class DeclarationFactory
{
    private readonly types: Types

    constructor(types: Types)
    {
        this.types = types
    }

    public makeValue = (value: any): Expression =>
    {
        return this.valueToExpression(value)
    }

    public makeDeclaration = (name: string, value: any, kind: 'var' | 'let' | 'const' = 'const'): VariableDeclaration =>
    {
        return this.types.variableDeclaration(kind, [
            this.types.variableDeclarator(
                this.types.identifier(name),
                this.valueToExpression(value)
            )
        ])
    }

    private valueToExpression = (value: any): Expression =>
    {
        const type = typeof value

        switch (true) {
            case value === undefined:   return this.types.identifier('undefined')
            case value === null:        return this.types.nullLiteral()
            case type === 'boolean':    return this.types.booleanLiteral(value)
            case type === 'number':     return this.types.numericLiteral(value)
            case type === 'string':     return this.types.stringLiteral(value)

            case value instanceof Array:
                return this.types.arrayExpression(value.map(this.valueToExpression))

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

    private getObjectProperties = (object: { [key in string | number]: any }): ObjectProperty[] =>
    {
        return Object.entries(object).reduce<ObjectProperty[]>((reducer, [ key, value ]) => {
            reducer.push(this.types.objectProperty(
                this.valueToExpression(key),
                this.valueToExpression(value),
            ))
            return reducer
        }, [])
    }
}

export { DeclarationFactory }
