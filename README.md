# 简介

towerflow 是一个面向使用typescript开发项目的流程化工具，适用于前端网站和nodejs等多种项目的开发。

工具可在 macOS, linux, window 下运行。

# 快速上手

## 安装

```
npm i towerflow -g

towerflow --help

```

## 创建 Hello World

使用 towerflow 创建web网站项目

```
towerflow init hello-world --template web-app
```

该命令会在当前目录下生成新的目录 `hello-world`, 并自动安装项目所需依赖

在该目录中，项目结构如下

```
hello-world
    |————node_modules
    |————README.md
	|————package.json
	|————package-lock.json
	|————typeings
	|       |————workaround.d.ts
	|       |————your-module
	|               |————index.d.ts
	|
	|————public
	|      |————index.html
	|      |————favicon.ico
	|
	|————src
	|     |————App.tsx
	|     |————index.tsx
	|
	|————test
	|      |————app.tsx
	|
```

你不需要任何复杂的配置，在初始化命令结束后，即可开始运行你的项目

进入你的项目目录
```
cd hello-world
```

## 项目运行

在当前目录下，运行项目启动命令

```
towerflow start
```

此时你的项目将运行在开发者模式下，在你的浏览器中打开 http://localhost:8080

开发模式是热更新模式，网页不会刷新就能应用你在项目中做出的更改

## 项目测试

在当前目录下，运行测试命令

```
towerflow test
```

此时工具将会运行`test`目录下编写测试用例，测试框架使用的是`jest`

关于更多测试相关的文档，请参考 https://jestjs.io/

## 项目打包

在当前目录下，运行项目打包命令

```
towerflow production
```

此时工具将会使用生产模式构建你的项目，并在根目录中的`output`文件中生成编译后的代码

该模式下会最大程度的优化你的代码，并在生成的文件名中加入`hash`

# 项目构建流程说明

`towerflow`主要有构建流程主要分为两种，`webpack` 和 `tsc`

## webpack

适用于`web-app`和`web-lib`

使用`webpack`和`webpack-dev-server`来构建前端网站和开前端模块组件

> `web-lib`在开发时使用`webpack`流程，打包时使用`tsc`流程

## tsc

适用于`node-app`、`node-lib`和`web-lib`

使用`tsc`来编译nodejs的服务器项目和node模块以及前端组件模块

# 项目结构说明

所有项目的打包生成的代码都存放于`output`目录中，测试代码都存放于`test`目录中，类型文件都存放于`typings`目录中

## node-lib

开发代码存放于`lib`目录下

## node-app

开发代码存放于`src`目录下，若要编写有交互的命令行工具，请在`bin`目录下编写入口代码

## web-lib

开发代码存放于`lib`目录下

## web-app

开发代码存放于`src`目录下，公共静态文件存放于`public`目录下

# 命令说明

## init [options] `<name>`

项目初始化命令

`name`为目标目录名称

```
towerflow init hello-word 
```

### --template [template]

指定需要初始化的项目类型

如创建`node-lib`项目

```
towerflow init hello-world --template node-lib
```

目前支持项目类型有

|项目类型|项目说明|
|---|---|
|node-lib|node模块项目|
|node-app|node服务器项目|
|web-lib|web模块项目|
|web-app|web网站项目|

### --force

若目标文件夹存在，使用该参数，则会强制删除目标文件夹，并初始化新的项目

```
towerflow init hello-world --template node-lib --force
```

### --bypass-npm

用于跳过`npm`安装依赖的步骤，若使用该命令，则需手动安装依赖

```
towerflow init hello-world --template node-lib --bypass-npm
```

### --use-cnpm

使用`cnpm`安装项目依赖，若要使用该命令，请确保已经全局安装`cnpm`

```
towerflow init hello-world --template node-lib --use-cnpm
```

## start

以开发模式运行项目

> 在`tsc`的开发流程中，则为`watch`模式

```
towerflow start
```

## test

运行项目的测视用例，所有测试文件都应存放于`test`目录中

```
towerflow test
```

## build

项目打包命令，以生产模式打包项目，打包过后的文件将存放于`output`目录中

```
towerflow build
```

## list

显示可用项目模板

```
towerflow list
```

## assistant

### --generate-config

生成项目配置文件，如`.prettierrc`,`tsling.js`,`tsconfig.json`,`jest.config.js`等，生成的配置文件仅用于帮助开发者编译器配置项目，不会作于开发、打包等的规范检查

```
towerflow assistant --generate-config
```

###

移除项目开发目录中的配置文件

```
towerflow assistant --remove-config
```