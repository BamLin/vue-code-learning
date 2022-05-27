/* @flow */

/**
 * 在 render.js 中的 initRender() 中，调用了 createElement() -> _createElement()
 */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

/**
 * Virtual DOM 除了它的数据结构的定义，映射到真实的 DOM 实际上要经历 VNode 的 create、diff、patch 等过程。
 * 在 Vue.js 中，VNode 的 create 是通过 createElement 方法创建的
 *
 * createElement 在渲染一个组件的时候的 3 个关键逻辑：
 * 1、构造子类构造函数，2、安装组件钩子函数 3、实例化 vnode。
 *
 * @param context vm实例
 * @param tag eg. div
 * @param data
 * @param children 子节点，子VNode
 * @param normalizationType
 * @param alwaysNormalize
 * @returns {VNode|Array<VNode>}
 */

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // data如果是 array，说明没有传data参数，实际上传的是children参数
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  // _createElement 真正的创建vnode
  return _createElement(context, tag, data, children, normalizationType)
}

// _createElement 真正的创建vnode， 追溯到 initRender
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {

  // data 有 __ob__属性，说明是 响应式的， 但是 不允许vnode的data是响应式的！！
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }

  // todo 重要，normalizeChildren ！！！ ，规范化 children 还不是很清楚 ？
  // todo 重要，normalizeChildren ！！！ ，规范化 children 还不是很清楚 ？
  // todo 重要，normalizeChildren ！！！ ，规范化 children 还不是很清楚 ？
  // Virtual DOM 实际上是一个树状结构，每一个 VNode 可能会有若干个子节点，这些子节点应该也是 VNode 的类型
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }

  // 到这里，children已经被处理成 一维的vnode ！！

  // todo VNode 的创建 ！！！！
  // todo VNode 的创建 ！！！！
  // todo VNode 的创建 ！！！！
  let vnode, ns
  // todo tag可以是个 string，也可以是个组件， @param tag eg. div, 如果是一个普通的 html 标签eg div，则会实例化一个普通 VNode 节点
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
        warn(`The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context)
      }
      // tag是string，说明传入的是一个标签，会实例化成一个普通的vnode节点，最后返回的 vnode；
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 传入的是component类型，通过 createComponent 方法创建一个组件 VNode。
      /**
       * 日常正常使用Vue时，都是组件化的形式去组织页面，所以，会走到这个逻辑里面
       * eg. render函数，但传的是一个组件 App.vue
       * var app = new Vue({
       *   el: '#app',
       *   // 这里的 h 是 createElement 方法
       *   render: h => h(App)
       * })
       * @type {VNode|Array<VNode>|void}
       */
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // todo tag可以是个 string，也可以是个组件，组件使用 createComponent方法
    // 如果是 tag 一个 Component 类型，则直接调用 createComponent 创建一个组件类型的 VNode 节点
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
