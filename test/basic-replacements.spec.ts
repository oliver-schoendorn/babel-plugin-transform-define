import { transform as babelTransform } from "@babel/core"

const transform = (sourceCode: string, replacements: { [key: string]: any }, debug: boolean = false): string =>
    babelTransform(sourceCode, { plugins: [
        [ './dist/index.js', Object.assign({}, replacements, { _debug: debug ? true : undefined }) ]
    ] }).code

const concat = (sourceCode: string): string =>
    sourceCode.replace(/^\s+|(\r\n|\n)/gm, '').replace(';', ';\n')

describe('Basic replacements', function () {
    it('should replace basic declaration', function () {
        const replacements = { TEST_VAR: 'foo' }
        const result = transform(`const test = TEST_VAR`, replacements, true)
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
    })

    it('should handle object and array replacements', function () {
        const replacements = {
            obj: {
                TRUE: true,
                FALSE: false,
                INT: -123,
                STRING: 'bar',
                NULL: null,
                UNDEFINED: undefined
            },
            array: [
                'foo', 'bar', 123, true, false, null
            ]
        }

        const code = `
            const myObject = obj
            const myArray = array
        `

        const result = concat(transform(code, replacements))
        expect(result).toContain(
            'const myObject = {"TRUE": true,"FALSE": false,"INT": -123,"STRING": "bar","NULL": null};'
        )
        expect(result).toContain(
            'const myArray = ["foo", "bar", 123, true, false, null];'
        )
    })

    it('should not replace assignment', function () {
        const result = transform(`const TEST_VAR = 'foo'`, { TEST_VAR: 'baz' })
        expect(result).toContain(`const TEST_VAR = 'foo'`)
    })

    it('should not mess with classes', function () {
        const result = transform(`class Test {}`, { Test: 'baz' })
        expect(result).toContain(`class Test {}`)
    })

    it('should not mess with object properties', function () {
        const result = concat(transform(`const foo = { Test: "lulz" }`, { Test: 'baz' }))
        expect(result).toContain(`const foo = {Test: "lulz"};`)
    })

    it('should not mess with imports', function () {
        const result = concat(transform(`import { Test } from 'where-ever'`, { Test: 'baz' }))
        expect(result).toContain(`import { Test } from 'where-ever'`)
    })

    it('should not mess with default imports', function () {
        const result = concat(transform(`import * as Test from 'where-ever'`, { Test: 'baz' }))
        expect(result).toContain(`import * as Test from 'where-ever'`)
    })

    it('should not overwrite declared variables', function () {
        const result = concat(transform(`
            const Test = 'complex'
            const another = Test
        `, { Test: 'baz' }, true))

        expect(result).toContain(`const Test = 'complex'`)
        expect(result).toContain(`const another = Test`)
    })
})
