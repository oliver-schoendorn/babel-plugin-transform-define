import { VariableDeclaration, Expression } from "babel-types"
import { DeclarationFactory } from "DeclarationFactory"
import { v1 } from 'uuid'

const memoize = <T>(callable: () => T): () => T =>
{
    let response: T = null
    return () => {
        if (! response) {
            response = callable()
        }
        return response as T
    }
}

interface Options
{
    [key: string]: any
}

interface Mapping
{
    key: string
    options: Options
}

interface Declaration
{
    value: () => Expression
    declaration: () => VariableDeclaration
}

interface Declarations
{
    [key: string]: Declaration
}

class DeclarationCache
{
    private static mappings: Mapping[] = []
    private static declarations: { [key: string]: Declarations } = {}

    private readonly declarations: Declarations
    private readonly declarationKeys: string[]

    public constructor(factory: DeclarationFactory, options: Options)
    {
        const mapping = DeclarationCache.mappings.find(mapping => mapping.options === options)
            || DeclarationCache.initialize(factory, options)

        this.declarations = DeclarationCache.declarations[mapping.key]
        this.declarationKeys = Object.keys(this.declarations)
    }

    private static initialize(factory: DeclarationFactory, options: Options): Mapping
    {
        const mapping: Mapping = {
            key: v1(),
            options: options
        }

        const declarations: Declarations = Object.entries(options).reduce<Declarations>((reducer, [ key, value ]) => {
            reducer[key] = {
                value: memoize(() => factory.makeValue(value)),
                declaration: memoize(() => factory.makeDeclaration(key, value))
            }
            return reducer
        }, {})

        DeclarationCache.mappings.push(mapping)
        DeclarationCache.declarations[mapping.key] = declarations

        return mapping
    }

    public exists = (key: string): boolean =>
    {
        return this.declarationKeys.includes(key)
    }

    public get = (key: string): Declaration =>
    {
        return this.declarations[key]
    }

    public getKeys = (): string[] =>
    {
        return Object.keys(this.declarations)
    }
}

export { DeclarationCache }
