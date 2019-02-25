import { transform, concat } from './helpers'

describe('Plugin options', function () {
    it('should load values from a file', function () {
        const result = concat(transform(
            `const config = fancy`,
            { fancy: 'shoes' },
            false,
            { file: './test/configMock' }
        ))

        expect(result).toContain(`const config = "pants";`)
    })

    it('should not parse member expressions', function () {
        const result = concat(transform(
            `const config = MY.CONFIG`,
            { 'MY.CONFIG': 'is nice' },
            false,
            { memberExpressions: false }
        ))

        expect(result).toContain(`const config = MY.CONFIG;`)
    })

    it('should not parse export expressions', function () {
        const result = concat(transform(
            `export { CONFIG }`,
            { 'CONFIG': 'is nice' },
            false,
            { exportExpressions: false }
        ))

        expect(result).toContain(`export { CONFIG };`)
    })

    it('should not parse export default expressions', function () {
        const result = concat(transform(
            `export default CONFIG`,
            { 'CONFIG': 'is nice' },
            false,
            { exportExpressions: false }
        ))

        expect(result).toContain(`export default CONFIG;`)
    })

    it('should not simplify unary expressions', function () {
        const result = concat(transform(
            `const boring = CONFIG ? true : false`,
            { 'CONFIG': 'is nice' },
            false,
            { evaluateConditionals: false }
        ))

        expect(result).toContain(`const boring = "is nice" ? true : false;`)
    })

    it('should not simplify binary expressions', function () {
        const result = concat(transform(
            `const boring = CONFIG === true`,
            { 'CONFIG': 'is nice' },
            false,
            { evaluateConditionals: false }
        ))

        expect(result).toContain(`const boring = "is nice" === true;`)
    })

    it('should not simplify if statements', function () {
        const result = concat(transform(
            `if (CONFIG) { doYourThing() }`,
            { 'CONFIG': 'is nice' },
            false,
            { evaluateConditionals: false }
        ))

        expect(result).toContain(`if ("is nice") {doYourThing();}`)
    })

    it('should log stuff', function () {
        const spy = jest.spyOn(console, "info").mockImplementation(() => {})

        concat(transform(
            `if (CONFIG) { doYourThing() }`,
            { 'CONFIG': 'is nice' },
            false,
            { verbose: true }
        ))

        expect(spy).toBeCalled()
        spy.mockRestore()
    })
})
