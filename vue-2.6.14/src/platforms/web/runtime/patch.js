/* @flow */

import * as nodeOps from 'web/runtime/node-ops' // 主要是 操作 DOM 的方法
import { createPatchFunction } from 'core/vdom/patch'

import baseModules from 'core/vdom/modules/index' // ref, directives 指令模块
import platformModules from 'web/runtime/modules/index' // platform中，attrs,klass,events,domProps,style,transition

// the directive module should be applied last, after all
// built-in modules have been applied. >>> 在应用了所有内置模块之后，应该最后应用指令模块。
// todo DOM上面 有的模块（modules/index： style，class，attrs等）是如果在DOM上实现的
const modules = platformModules.concat(baseModules)

// todo createPatchFunction
export const patch: Function = createPatchFunction({ nodeOps, modules })
