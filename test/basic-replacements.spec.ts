import { transform as babelTransform } from "@babel/core"

const transform = (sourceCode: string, replacements: { [key: string]: any }): string =>
    babelTransform(sourceCode, { plugins: [ [ './dist/index.js', replacements] ] }).code

describe('Basic replacements', function () {
    it('should replace basic declaration', function () {
        const replacements = { TEST_VAR: 'foo' }
        const result = transform(`const test = TEST_VAR`, replacements)
        expect(result).toContain(`const test = ${JSON.stringify(replacements.TEST_VAR)}`)
    })

    it('should handle primitive replacements', function () {
        const replacements = {
            TRUE: true,
            FALSE: false,
            INT: 123,
            STRING: 'foo',
            NULL: null
        }

        const code = `
            const truthy = TRUE
            const falsy = FALSE
            const integer = INT
            const aString = STRING
            const aNull = NULL
        `

        const result = transform(code, replacements)
        expect(result).toContain(`const truthy = true`)
        expect(result).toContain(`const falsy = false`)
        expect(result).toContain(`const integer = 123`)
        expect(result).toContain(`const aString = "foo"`)
        expect(result).toContain(`const aNull = null`)

        console.debug(result)
    })

    it('should not replace assignment', function () {
        const result = transform(`const TEST_VAR = 'foo'`, { TEST_VAR: 'baz' })
        expect(result).toContain(`const TEST_VAR = 'foo'`)
    })
})
