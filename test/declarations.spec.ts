import { transform, concat } from './helpers'

describe('Declaration Tests', function () {
    it('should replace basic declaration', function () {
        const replacements = { TEST_VAR: 'foo' }
        const result = transform(`const test = TEST_VAR`, replacements)
        expect(result).toContain(`const test = ${JSON.stringify(replacements.TEST_VAR)}`)
    })

    it('should handle chained declarations', function () {
        const replacements = { TEST_VAR: 'foo' }
        const result = transform(`const test = foo = TEST_VAR`, replacements)
        expect(result).toContain(`const test = foo = ${JSON.stringify(replacements.TEST_VAR)}`)
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
            'const myObject = {"TRUE": true,"FALSE": false,"INT": -123,"STRING": "bar","NULL": null,' +
                '"UNDEFINED": undefined};'
        )
        expect(result).toContain(
            'const myArray = ["foo", "bar", 123, true, false, null];'
        )
    })

    it('should handle property assignments', function () {
        const result = concat(transform(`
                const VAR = { some: 'thing', TEST }
            `,
            { TEST: { variable: 'string' }, VAR: { lol: true } }
        ))
        expect(result).toContain(`const VAR = {some: 'thing',TEST: {"variable": "string"}};`)
    })

    it('should handle spreads', function () {
        const result = concat(transform(`
                const VAR = { some: 'thing' }
                const foo = { baz: 'bar', ...TEST, ...VAR }
            `,
            { TEST: { variable: 'string' }, VAR: { lol: true } }
        ))

        expect(result).toContain(`const foo = {baz: 'bar',...{"variable": "string"},...VAR};`)
    })

    it('should handle member expressions', function () {
        const result = concat(transform(
            `const foo = process.env.FOO`,
            { 'process.env.FOO': 'bar'}
        ))

        expect(result).toContain(`const foo = "bar";`)
    })

    it('should not handle defined member expressions', function () {
        const result = concat(transform(`
                const process = { env: { Foo: 'foo' } }
                const foo = process.env.FOO
            `,
            { 'process.env.FOO': 'bar'}
        ))

        expect(result).toContain(`const foo = "bar";`)
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

    it('should not overwrite declared variables', function () {
        const result = concat(transform(`
            const Test = 'complex'
            const another = Test
        `, { Test: 'baz' }))

        expect(result).toContain(`const Test = 'complex'`)
        expect(result).toContain(`const another = Test`)
    })

    it('should punish developers who don\'t RTFM', function () {
        expect(
            () => transform(
                `const test = MY_FN`,
                { MY_FN: () => 'lol' }
                )
        ).toThrow(/^\[babel-plugin-transform-define\]/i)
    })
})
