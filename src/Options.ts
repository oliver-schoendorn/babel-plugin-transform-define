export type Primitives = string | number | boolean | undefined | null

export interface Replacements
{
    [key: string]: Primitives | Primitives[] | Replacements
}

export interface Options
{
    /**
     * These values / keys will be replaced in your scripts by this transformer
     *
     * Only primitives, array of primitives or objects with string-keys and primitives are supported
     */
    values?: Replacements

    /**
     * Instead of passing an object with replacements values (Options.values), you can pass
     * a path to a file that exports the replacement values (only primitives, array of primitives or objects)
     *
     * Paths are relative from your babel config.
     */
    file?: string

    /**
     * Enables the transformation of member expressions
     * If disabled, replacement of for example "process.env.NODE_ENV" will not work.
     *
     * Default: true
     */
    memberExpressions?: boolean

    /**
     * Enables the transformation of export expressions
     * If enabled, the transformer will replace exported values that are undefined but present in the Options.values
     *
     * Default: true
     */
    exportExpressions?: boolean

    /**
     * Enables the evaluation and simplification of conditionals, that have been affected by a replacement.
     * If enabled, the transformer will attempt to resolve if statements, unary and binary expressions.
     * Example:
     *  "if (process.env.NODE_ENV === 'production') { doStuff() }" will be transformed to
     *  "{ doStuff() }" if the expression result is truthy
     *
     *  "const myVar = MY_REPLACED_VAR === 'foo' ? 'yep' : 'nope'" will be transformed to
     *  "const myVar = 'yep'" or "const myVar = 'nope'", depending on the comparison outcome.
     *
     *  "if (MY_REPLACED_VAR === true && somethingElse) { ... }" will become (if MY_REPLACED_VAR is truthy)
     *  "if (true && somethingElse) { ... }"
     *
     * Default: true
     */
    evaluateConditionals?: boolean

    /**
     * If enabled, the plugin will print out all transformations, that have been performed, to the console.
     *
     * Default: false
     */
    verbose?: boolean
}

export const defaultOptions: Options = {
    values: null,
    file: null,
    memberExpressions: true,
    exportExpressions: true,
    evaluateConditionals: true,
    verbose: false
}
