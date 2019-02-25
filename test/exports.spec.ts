import { transform, concat } from './helpers'

describe('Export Tests', function () {
    it('should replace export specifier', function () {
        const result = concat(transform(`export { Test }`, { Test: 'baz' }))
        expect(result).toContain(`const Test = "baz";`)
        expect(result).toContain(`export { Test }`)
    })

    it('should replace named export specifier', function () {
        const result = concat(transform(`export { Test as Foo }`, { Test: 'baz' }))
        expect(result).toContain(`const Test = "baz";`)
        expect(result).toContain(`export { Test as Foo };`)
    })

    it('should not break exports', function () {
        const result = concat(transform(`
            const global = "Foo Bar Baz"
            export { global as Global, Test as Foo, anotherGlobal as AGlobal }
        `, { Test: 'baz' }))
        expect(result).toContain(`const global = "Foo Bar Baz";`)
        expect(result).toContain(`const Test = "baz";`)
        expect(result).toContain(`export { global as Global, Test as Foo, anotherGlobal as AGlobal };`)
    })

    it('should replace default export declaration', function () {
        const result = concat(transform(`export default Test`, { Test: { foo: 'bar' } }))
        expect(result).toContain(`const Test = {"foo": "bar"};`)
        expect(result).toContain(`export default Test;`)
    })

    it('should not overwrite defined exports', function () {
        const result = concat(transform(`const Test = "foo"; export { Test }`, { Test: 'baz' }))
        expect(result).toContain(`const Test = "foo";`)
        expect(result).toContain(`export { Test };`)
    })

    it('should not mess with imports', function () {
        const result = concat(transform(`import { Test } from 'where-ever'`, { Test: 'baz' }))
        expect(result).toContain(`import { Test } from 'where-ever'`)
    })

    it('should not mess with default imports', function () {
        const result = concat(transform(`import * as Test from 'where-ever'`, { Test: 'baz' }))
        expect(result).toContain(`import * as Test from 'where-ever'`)
    })
})
