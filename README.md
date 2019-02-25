# babel-plugin-transform-define
[![Build Status](https://travis-ci.com/oliver-schoendorn/babel-plugin-transform-define.svg?branch=master)](https://travis-ci.com/oliver-schoendorn/babel-plugin-transform-define)
[![Coverage Status](https://coveralls.io/repos/github/oliver-schoendorn/babel-plugin-transform-define/badge.svg?branch=master)](https://coveralls.io/github/oliver-schoendorn/babel-plugin-transform-define?branch=master)

This [Babel](https://babeljs.io/) plugin will take a set of config values (or load them from a file path) and replace all occurrences in the parsed scripts.
This plugin is compatible with [Babel](https://babeljs.io/) 7. Other [Babel](https://babeljs.io/) versions have not been tested.

`npm i -D @oliver-schoendorn/babel-plugin-transform-define`


### Configuration example (.babelrc, static config)

```json
{
    "plugins": [
        [ "@oliver-schoendorn/babel-plugin-transform-define", {
            "values": { "your": "values" } 
        } ]
    ]
}
```

### Configuration example (.babelrc, config from file)

```json
{
    "plugins": [
        [ "@oliver-schoendorn/babel-plugin-transform-define", {
            "file": "./src/config" 
        } ]
    ]
}
```

## Examples

All of the following example will use these plugin config values:
```json
{
  "values": {
    "process.env.NODE_ENV": "production",
    "isProduction": true,
    "CONFIG": {
      "API_HOST": "https://your.domain/"
    },
    "VAR": null,
    "TEST_STUFF": "/^foo$/igm",
    "didRTFM": true
  }
}
```

### Variable declarations

Input
```ecmascript 6
const initState = { initialized: true }
const appState = { global: { ...CONFIG, isProduction }, ...initialized }
const thisWorks = asWell = isProduction
const VAR = { CONFIG }
```

Output
```ecmascript 6
const initState = { initialized: true }
const appState = { global: { ...{ "API_HOST": "https://your.domain" } }, ...initialized }
const thisWorks = asWell = true
const VAR = { CONFIG: { "API_HOST": "https://your.domain" } }
```

### Assignments and calls

Input
```ecmascript 6
const myObject = {}, isProduction = false
myObject.foo = VAR
myObject.isProduction = isProduction

new RegExp(TEST_STUFF)

Object.keys(CONFIG).map(key => console.log(key))
```

Output
```ecmascript 6
const myObject = {}, isProduction = false
myObject.foo = null
myObject.isProduction = isProduction

new RegExp("/^foo$/igm")

Object.keys({ "API_HOST": "https://your.domain" }).map(key => console.log(key))
```

### Exports

Input
```ecmascript 6
export { CONFIG }
export default isProduction
```

Output
```ecmascript 6
const CONFIG = { "API_HOST": "https://your.domain" }
export { CONFIG }

const isProduction = true
export default isProduction
```

### Conditionals evaluation

Input
```ecmascript 6
if (isProduction) { doThings() }
else { doSomthingElse() }

if (! isProduction) { whatEver() }
else { sorcery() }

const youAre = didRTFM ? 'awesome' : 'lazy'
const complicated = didRTFM && ! isProduction

const canNotEvaluate = didRTFM && require('./aScript')
```

Output
```ecmascript 6
{ doThings() }
{ sorcery() }

const youAre = 'awesome'
const complicated = false
const canNotEvaluate = true && require('./aScript')
```


## Options

| Option key                | Description                                                                                                                                                                                                                                                 | Type      | Default value |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|----------------|
| **values**                | Object with keys and values, that should be replaced.<br> **Please note that only the top level keys will be used for replacement.**<br> <br> If you want to define `process.env.NODE_ENV` for instance, <br>use `{ "process.env.NODE_ENV": "production" }` | `object`  | `{}`           |
| **file**                  | Instead of passing an object, you can also reference a file. <br>The given path has to be relative to your babel config and <br>should use `module.exports = { API_HOST: "https://..." }`                                                                   | `string`  | `undefined`    |
| **memberExpressions**     | You can disable the processing of member expressions (`node.env.NODE_ENV`).                                                                                                                                                                                 | `boolean` | `true`         |
| **exportExpressions**     | Toggles the processing of export expressions (`export { MY_CONFIG }` or `export default MY_CONFIG`).                                                                                                                                                        | `boolean` | `true`         |
| **evaluateConditionals**  | Toggles the evaluation and simplification of If Statements, Unary Statements and so on.                                                                                                                                                                     | `boolean` | `true`         |
| **verbose**               | If set to true, some information about the replaced nodes and their types will be printed to the console.                                                                                                                                                   | `boolean` | `false`        |

