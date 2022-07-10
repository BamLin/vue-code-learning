# vue-code-learning


对最新的 vue-2.6.14 进行源码分析～


## Vue源码目录


* compiler - 编译相关的所有代码，包括把模板解析成ast语法树，ast语法树优化，代码生成等功能。
* core - 核心代码，需要重点分析
  * components - 内置组件
  * global-api - 全局 API 封装
  * instance - Vue实例化
  * observer - 观察者
  * util - 工具函数
  * vdom - 虚拟DOM
* platforms - Vue对于不同平台的支持，包含Vue.js的入口
* server - 服务端渲染，该部分代码是跑在服务端的Node.js
* sfc - .vue文件的解析，使之变成一个 JavaScript 的对象
* shared - 定义了一些工具方法，浏览器端和服务器端的Vue.js都会使用



## 阅读源码前置知识
rollup
webpack