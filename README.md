# vue-code-learning


对最新的 vue-2.6.14 进行源码分析～


## Vue源码目录

```markdown
src
├── compiler        # 编译相关 
├── core            # 核心代码 - 重点分析
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```
内置组件、全局 API 封装，Vue 实例化、观察者、虚拟 DOM、工具函数等等。
* core
  * components 内置组件
  * global-api 全局 API 封装
  * instance Vue实例化
  * observer 观察者
  * util 工具函数
  * vdom 虚拟DOM




## 阅读源码前置知识
rollup
webpack