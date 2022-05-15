/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

/**
 * // Vue 中是通过 $mount 实例方法去挂载 vm 的，$mount 方法在多个文件中都有定义
 *
 * $mount 方法实际上会去调用 mountComponent 方法，这个方法定义在 src/core/instance/lifecycle.js 文件中
 *
 * // 在之前，Vue.prototype.$mount 已经被定义过了， platforms/runtime/index.js
 *  --->
 * // // public mount method
 * // Vue.prototype.$mount = function (
 * //   el?: string | Element,
 * //   hydrating?: boolean
 * // ): Component {
 * //   el = el && inBrowser ? query(el) : undefined
 * //   return mountComponent(this, el, hydrating)
 * // }
 */

const mount = Vue.prototype.$mount // 缓存，最后render用
//
// todo 在这里又 重新定义了一遍 why？
//  platforms/runtime/index.js 中定义的mount是给 runtime only版本的代码使用的，只是在runtime with compiler版本简单的复用

// init中调用： vm.$mount(vm.$options.el)
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el) // 这一步执行完，el已经转换为一个 dom对象

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  /**
   * Vue 最终都是通过render函数去编译渲染 ！！
   * 没有传入render对象，那么就会将template or el 转换为 render方法
   */
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') { // xx.charAt(0) 返回字符串中的第一个字符
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }

    /**
     * 将template 转换为 render
     * 通过 compileToFunctions， 拿到 render， staticRenderFns
     */
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render // 没有render，也要创造render ！
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 在之前，Vue.prototype.$mount 已经被定义过了， platforms/runtime/index.js
// // public mount method
// Vue.prototype.$mount = function (
//   el?: string | Element,
//   hydrating?: boolean
// ): Component {
//   el = el && inBrowser ? query(el) : undefined
//   return mountComponent(this, el, hydrating)
// }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 * >>> 获取元素的外层HTML，小心IE 中的 SVG 元素也是如此。
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
