/* @flow */

/**
 *
 * 调用逻辑顺序： $mount -> mountComponent(lifecycle.js) -> updateComponent -> vm._render()
 * render方法
 *
 */
import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  /**
   * VNode 的 create 是通过 createElement 方法创建的
   */
  /* vm._c 是在 程序将templates编译成 render方法时调用 ，createElement(...,false/true) !! */
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  /* 上方与下方的区别， vm.$createElement 是在 用户自己编写 render方法时，被调用 !! */
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}

export let currentRenderingInstance: Component | null = null

// for testing only
export function setCurrentRenderingInstance (vm: Component) {
  currentRenderingInstance = vm
}

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  /**
   *
   * _render ，返回的是  VNode，
   * 是实例的一个私有方法，它用来把实例渲染成一个虚拟 Node
   *
   * 调用逻辑顺序： $mount -> mountComponent(lifecycle.js) -> updateComponent -> vm._render()
   *
   * vm._render 最终是通过执行 createElement 方法并返回的是 vnode，它是一个虚拟 Node。
   * Vue 2.0 相比 Vue 1.0 最大的升级就是利用了 Virtual DOM
   */
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm

      /**
       * 在 Vue 的官方文档中介绍了 render 函数的第一个参数是 createElement，那么结合之前的例子：
       * <div id="app">
       *   {{ message }}
       * </div>
       * 相当于我们编写如下 render 函数：
       * render: function (createElement) {
       *   return createElement('div', {
       *      attrs: {
       *         id: 'app'
       *       },
       *   }, this.message)
       * }
       */
      // todo vm._renderProxy 细节？？？？
      // todo vm._renderProxy 细节？？？？
      //  vm.$createElement 在上方initRender中有定义，调用createElement方法生成 !!!!
      // 实际上，vm.$createElement 方法定义是在执行 initRender 方法的时候，
      // 可以看到除了 vm.$createElement 方法，还有一个 vm._c 方法，它是被模板编译成的 render 函数使用，
      // 而 vm.$createElement 是用户手写 render 方法使用的，
      // 这俩个方法支持的参数相同，并且内部都调用了 createElement 方法
      vnode = render.call(vm._renderProxy, vm.$createElement)


    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}
