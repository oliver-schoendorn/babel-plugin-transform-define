import { transform as babelTransform } from "@babel/core"
import { Options } from '../src/Options'

export const transform = (
    sourceCode: string,
    replacements: { [key: string]: any },
    debug: boolean = false,
    additionalOptions: Partial<Options> = {}
): string =>
    babelTransform(sourceCode, { plugins: [[ './dist/index.js', Object.assign<Options>({},
            { values: replacements },
            { verbose: debug ? true : undefined },
            additionalOptions
    ) ]] }).code

export const concat = (sourceCode: string): string => sourceCode
    .replace(/^\s+/gm, '')
    .replace(/(\r\n|\n)/gm, '')
