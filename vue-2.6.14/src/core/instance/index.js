import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 * Vue
 * 从entry-runtime-with-compiler.js 追踪到这里，Vue其实是一个 function实现的类，通过 new Vue去实例化
 * todo 为什么不用 class 去实现？
 *  -- Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，
 *  这种方式是用 Class 难以实现的。这么做的好处是非常方便代码的维护和管理
 * @param options
 * @constructor
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
