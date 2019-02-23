import { PluginObj, types as Types } from "babel-core"
import { NodePath } from "babel-traverse"
import { isVariableDeclarator } from "babel-types"

interface Arguments
{
    types: typeof Types
}

const identify = {
    Identifier(path) {
        console.log("======== TRAVERSING: " + path.node.name + " ============");
    },
    AssignmentPattern(path) {
        console.log('Assignment: ' + path.node.name)
    }
}

const isDeclaration = (path: NodePath): boolean =>
    path.parentPath.isVariableDeclarator() ||
    path.parentPath.parentPath.isVariableDeclarator() ||
    path.parentPath.isSpreadElement()


const debug = (node: NodePath) =>
{
    return {
        type: node.type,
        parentType: node.parentPath.type,
        parentParentType: node.parentPath.parentPath.type,
        isVariableDeclarator: node.parentPath.isVariableDeclarator(),
        isVariableDeclaration: node.parentPath.isVariableDeclaration(),
        isDeclareVariable: node.parentPath.isDeclareVariable(),
        isReferenced: node.isReferenced(),
        isIdentifier: node.isIdentifier(),
        isBindingIdentifier: node.isBindingIdentifier(),
        isReferencedIdentifier: node.isReferencedIdentifier(),
        isAssignmentPattern: node.isAssignmentPattern(),
        isParentAssignmentPattern: node.parentPath.isAssignmentPattern(),
        isAssignmentExpression: node.parentPath.isAssignmentExpression()
    }
}

const testVars = /^TEST([a-z0-9_\-])*$/i

interface PluginOptions
{
    [key: string]: any
}

let pluginOptions: object|null = null
let pluginOptionKeys: string[]|null = null
const pluginOptionsIncludeKey = (key: string|number, options: PluginOptions): key is keyof PluginOptions =>
{
    if (pluginOptions !== options) {
        pluginOptions = options
        pluginOptionKeys = Object.keys(options)
    }

    return pluginOptionKeys.includes(key as string)
}


const Plugin: ((babel: Arguments) => PluginObj) = ({ types }) =>
{
    return {
        name: 'transform-define',
        visitor: {
            AssignmentExpression(path) {
                console.log("Assignment: " + path.node.left.type + " / " + path.node.right.type)
            },
            Identifier(path, { opts }) {
                if (pluginOptionsIncludeKey(path.node.name, opts)) {
                    const replacement = pluginOptions[path.node.name]

                    if (isDeclaration(path) && path.isIdentifier() && path.isReferenced()) {
                        path.replaceWithSourceString(JSON.stringify(replacement))
                    }
                }

                if (testVars.test(path.node.name)) {
                    console.log('==================')


                    if (isDeclaration(path) && path.isIdentifier() && path.isReferenced()) {
                        console.log({
                            replace: path.parentPath.getSource(),
                            self: path.getSource(),
                            type: path.type,
                            parentType: path.parentPath.type,
                            parentParentType: path.parentPath.parentPath.type,
                            parentParentParentType: path.parentPath.parentPath.parentPath.type,
                            opts
                        })
                        return
                    }

                    // else {
                        console.log({
                            source: path.parentPath.getSource(),
                            self: debug(path),
                            // parent: debug(path.parentPath)
                        })
                    // }


                    // const parentPath = node
                    // if (parentPath.isVariableDeclarator()) {
                    //     console.log('What the?', path.parent.type)
                    // }
                    // node.isDeclaration()
                    // console.log('DOOOOO STUFF: ' + node.type)
                    // path.traverse(identify)
                }
            },
            // Declaration(path) {
                // console.log('We have a declaration ' + path.node.type)
                // if (path.isVariableDeclaration()) {
                //     console.log(path.node.declarations)
                // }
            // }
        }
    }
}

module.exports = Plugin
