# vue文档生成插件

## 简介

1. 根据vue组件内容一键生成markdown组件文档

## 安装

```shell
npm install vue2markdown -D
```

## 使用

### 在package.json中添加命令
```json
"scripts": {
    "gen:docs": "vdocs gen:docs"
}
```

### 一键为您所有的组件生成文档
```
npm run gen:docs
```
### 为单个组件生成文档

```
npm run gen:docs -- -t 'D:\code\CRM\src\components\AddRecords\AddRecords.vue'
```

## 配置
```shell
npx run gen:docs -t component.vue -m  componentname -o -d docs/ui
```
- -t --target [p]     目标文件绝对路径
- -m --mdname [p]     生成的md文件名
- -o --override       如有同名文件，是否覆盖
- -d --outDir [p]     生成md文件所放目录
- -e --exampleDir [P] 生成demo文件所放目录


为什么不用 https://vue-styleguidist.github.io/docs/docgen-cli.html#install 而自己造轮子？

主要不满足我们文档目前的场景
1.没有md内容提取策略 (contentStrategy)
2.如果目标MD文件已存在，没有配置决定是否覆盖生成还是增量生成
3.单文件提取不友好

https://vue-styleguidist.github.io/docs/docgen-cli.html#install 也非常好用，只是不适用于我们目前场景，因此在其核心api上封装一层。

```js
/**
 * md内容提取策略
 *
 * 组件文档结构存在下面的场景
 *
 * -packages
 *   -table
 *      -src
 *         -table.vue
 *         -filter-panel.vue
 *  -addBtn
 *      -index.vue
 *  -edit
 *      -src
 *         -InlineEdit.vue
 *         -SwichEdit.vue
 *  -fileList
 *      -file.vue
 *      -index.vue
 *
 * 即一个组件文件夹下可能多个vue文件，或者只有一个vue文件
 * 对于一个vue文件，我们直接提取里面内容, 或者不提取
 * 对于多个vue文件，我们需要制定策略，需要提取index.vue还是{component}.vue,又或者是提取全部vue文件内容到一个md中
 *
 * 默认策略如下
 * index: index.vue
 * compenent: 同名component.vue
 * all: 在此如果都没有，则提取所有vue文件
 */
```

## 致谢

1. 本插件参考 https://vue-styleguidist.github.io/docs/Docgen.html

向以上人员致谢

# 许可

MIT License
