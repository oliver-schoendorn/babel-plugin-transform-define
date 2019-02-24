import { transform as babelTransform } from "@babel/core"

export const transform = (sourceCode: string, replacements: { [key: string]: any }, debug: boolean = false): string =>
    babelTransform(sourceCode, { plugins: [
            [ './dist/index.js', Object.assign({}, replacements, { _debug: debug ? true : undefined }) ]
        ] }).code

// export const concat = (sourceCode: string): string =>
//     sourceCode.replace(/^\s+|(\r\n|\n)/gm, '').replace(';', ';\n')

export const concat = (sourceCode: string): string => sourceCode
    .replace(/^\s+/gm, '')
    .replace(/(\r\n|\n)/gm, '')
