import { transform, concat } from './helpers'

describe('Conditional Tests', function () {
    it('should remove truthy if statements', function () {
        const result = concat(transform(
            `if (ENV === 'production') { fn('stuff') }`,
            { ENV: 'production' }
        ))

        expect(result).toContain(`{fn('stuff');}`)
        expect(result).not.toContain(`if (true)`)
    })
    it('should remove truthy if statements if nested', function () {
        const result = concat(transform(
            `if ((true && (ENV === 'production')) || true) { fn('stuff') }`,
            { ENV: 'production' }
        ))

        expect(result).toContain(`{fn('stuff');}`)
        expect(result).not.toContain(`if (true)`)
    })

    it('should remove falsy if statements', function () {
        const result = concat(transform(
            `if (ENV === 'staging') { fn('another thing') }`,
            { ENV: 'production' }
        ))

        expect(result).not.toContain(`{fn('another thing');}`)
    })

    it('should not remove unresolvable if statements', function () {
        const result = concat(transform(
            `if (ENV === 'production' && unknown) { fn('what ever') }`,
            { ENV: 'production' }
        ))

        expect(result).toContain(`if (true && unknown) {fn('what ever');}`)
    })

    // Todo: Simplify unary statements
    it('should simplify truthy unary statements', function() {
        const result = concat(transform(
            `const cooking = ENV === 'production' ? true : false`,
            { ENV: 'production' }
        ))

        expect(result).toContain(`const cooking = true`)
    })

    it('should simplify falsy unary statements', function() {
        const result = concat(transform(
            `const run = GIRLFRIEND !== 'lovely' ? true : false`,
            { GIRLFRIEND: 'annoying' }
        ))

        expect(result).toContain(`const run = true`)
    })

    it('should simplify falsy unary statements (!==)', function() {
        const result = concat(transform(
            `const cooking = ENV !== 'production' ? true : false`,
            { ENV: 'production' }
        ))

        expect(result).toContain(`const cooking = false`)
    })

    it('should simplify binary statements', function () {
        const result = concat(transform(
            `const tasty = COOKS === 1 && ENV === 'production' ? true : false`,
            { COOKS: 1, ENV: 'production' }
        ))

        expect(result).toContain(`const tasty = true`)
    })
})
