import { transform, concat } from './helpers'

describe('Assignment Tests', function () {
    it('should replace object property assignment', function () {
        const result = concat(transform(`const obj = { prop: Test }`, { Test: 'baz' }))
        expect(result).toContain(`const obj = {prop: "baz"};`)
    })

    it('should replace call expression', function () {
        const result = concat(transform(`foo(Test)`, { Test: 'baz' }))
        expect(result).toContain(`foo("baz");`)
    })

    it('should replace new expression', function () {
        const result = concat(transform(`new Foo(Test)`, { Test: 'baz' }))
        expect(result).toContain(`new Foo("baz");`)
    })

    it('should replace assignment expression', function () {
        const result = concat(transform(`Foo.Prop = Test`, { Test: 'baz' }))
        expect(result).toContain(`Foo.Prop = "baz";`)
    })
})
