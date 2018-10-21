# 目录

<!-- prettier-ignore-start -->

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [目录](#目录)
* [正文](#正文)
* [注意](#注意)

<!-- /code_chunk_output -->

<!-- prettier-ignore-end -->

# 正文

# 类型

1. node-app: 可直接运行的主运行程序。一般需要被部署在生产服务器上。
1. node-cli: 一个命令行应用，一般作为某一个 node-lib 的外壳。
1. node-lib: 作为一个库存在。
1. web-app: 一个完整的 web 应用。
1. web-lib: 作为一个前端组件库存在，需要同时具备单组件调试功能。

# 注意

1. 编写代码的过程中，尽量以 template 目录下的配置文件为准。即：如果你需要使用一些与目录结构相关的功能时.

"./src/app.ts
Module Warning (from ../node_modules/tslint-loader/index.js):
[7, 1]: unused expression, expected an assignment or function call
"

"C:\Users\duguagua\Project\towerflow\test-app\src\app.ts
./src/app.ts
Towerflow pack [1m[31mcode: 2304,severity: error,content: Cannot find name 'f'.,file: C:\Users\duguagua\Project\towerflow\test-app\src\app.ts,line: 7,character: 1,context: C:\Users\duguagua\Project\towerflow\test-app[39m[22m"

C:\Users\duguagua\Project\towerflow\test-app\src\app.ts
./src/app.ts
Towerflow pack code: 2304,severity: error,content: Cannot find name 'f'.,file: C:\Users\duguagua\Project\towerflow\test-app\src\app.ts,line: 7,character: 1,context: C:\Users\duguagua\Project\towerflow\test-app

c:\Users\duguagua\Project\towerflow\test-app\src\app.ts
./src/app.ts
[tsl] ERROR in c:\Users\duguagua\Project\towerflow\test-app\src\app.ts(7,1)
TS2304: Cannot find name 'f'.

## 原始的 tsloader 错误提示

```
ERROR in c:\Users\duguagua\Project\towerflow\src\webpack\run-webpack.ts
./src/webpack/run-webpack.ts
[tsl] ERROR in c:\Users\duguagua\Project\towerflow\src\webpack\run-webpack.ts(13,1)
      TS2304: Cannot find name 'a'.
```

## 原始的 tslint 错误提示

```
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
