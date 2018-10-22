# 目录

<!-- prettier-ignore-start -->

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [目录](#目录)
* [应用类型](#应用类型)
* [node-app](#node-app)
* [node-lib](#node-lib)
* [web-app](#web-app)
* [web-lib](#web-lib)
* [附录 1 - 各种 loader 的错误提示格式](#附录-1-各种-loader-的错误提示格式)
	* [原始的 tsloader 错误提示](#原始的-tsloader-错误提示)
	* [原始的 tslint 错误提示](#原始的-tslint-错误提示)

<!-- /code_chunk_output -->

<!-- prettier-ignore-end -->

# 应用类型

1. node-app: 可直接运行的主运行程序。当需要被部署在生产服务器上时，主要使用 src/index.ts 文件进行开发，此时的 bin/index.ts 文件仅作为占位使用；当希望发布 cli 应用时，情况正相反。
1. node-lib: 通常用来发布一个 node 库。
1. web-app: 一个完整的 web 应用。
1. web-lib: 作为一个前端组件库存在，同时具备单组件（human-testing）调试功能。

在开发 lib 时，我们需要指定编译后的 js 版本而不是直接发布 ts 源代码以供用户源代码级编译。这是一种权衡和考量。
我们预设发布 node-lib 的版本为`esnext`，而发布 web-lib 的版本为`es2015`。

# node-app

1. 编译后的**dirname 和**filename 固定为`dist`和`dist/index.js, dist/bin.js`。请注意路径应用问题。

# node-lib

1. 编译后的**dirname 和**filename 固定为`dist`和`dist/index.js, dist/bin.js`。请注意路径应用问题。

# web-app

# web-lib

# 附录 1 - 各种 loader 的错误提示格式

## 原始的 tsloader 错误提示

```js
ERROR in c:\Users\duguagua\Project\towerflow\src\webpack\run-webpack.ts
./src/webpack/run-webpack.ts
[tsl] ERROR in c:\Users\duguagua\Project\towerflow\src\webpack\run-webpack.ts(13,1)
      TS2304: Cannot find name 'a'.
```

## 原始的 tslint 错误提示

```js
WARNING in ./src/webpack/format-webpack-messages.ts
Module Warning (from ./node_modules/tslint-loader/index.js):
[21, 33]: Shadowed name: 'message'
[21, 24]: non-arrow functions are forbidden
[67, 24]: non-arrow functions are forbidden

 @ ./src/webpack/create-webpack-compiler.ts 5:0-66 45:25-46
 @ ./src/webpack/run-webpack.ts
 @ ./src/production.ts
 @ ./bin/index.ts
```
