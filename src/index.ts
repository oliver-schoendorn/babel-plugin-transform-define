import { BabelPluginTransformDefine } from './BabelPluginTransformDefine'

module.exports = function({ types }, options) {
    return (new BabelPluginTransformDefine(types, options)).make()
}
