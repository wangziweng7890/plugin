# Vuepress v2 插件

## 简介

1. 使用自定义 ::: demo 语法，写一遍示例即可自动生成组件示例与代码示例；
2. 支持code在线编辑,包括编辑含import的代码，支持在编辑页额外import其它的文件 （仅开发模式可以）

## 安装

```shell
npm i vuepress2-plugin-demo-block-edit -D
```

## 使用

在 `.vuepress/config.ts`  添加此插件:

```ts
import v2 from 'vuepress2-plugin-demo-block-edit'

export default = {
  // ...
  plugins: [v2()]
}
```

## 开发

**在进行完以上操作后，您即可使用本插件所有功能进行文档开发**

1. 在.vuepress 新建目录component和examples
2. 在component下新建你的md文档，eg: button.md
  在`.md` 文件中使用以下语法( :::demo ::: 中间包裹的是被渲染组件在examples下的路径)

  ```markdown
  ::: demo
  
  button/basic
  
  :::
  ```
3. 在examples下新建button文件夹，并在文件夹下新建basic.vue
  内容如下

  ```vue
  <script setup lang="ts">
  import { ElButton } from 'element-plus'
  const buttons = [
      { type: '', text: 'plain' },
      { type: 'primary', text: 'primary' },
      { type: 'success', text: 'success' },
      { type: 'info', text: 'info' },
      { type: 'warning', text: 'warning' },
      { type: 'danger', text: 'danger' },
  ]
  </script>
  
  <template>
      <p>Basic text button</p>
      <div class="flex justify-space-between mb-4 flex-wrap gap-4">
          <el-button v-for="button in buttons" :key="button.text" :type="button.type" text>
              {{ button.text }}
          </el-button>
      </div>
  
      <p>Background color always on</p>
      <div class="flex justify-space-between mb-4 flex-wrap gap-4">
          <el-button v-for="button in buttons" :key="button.text" :type="button.type" text bg>
              {{ button.text }}
          </el-button>
      </div>
  
      <p>Disabled text button</p>
      <div class="flex justify-space-between flex-wrap gap-4">
          <el-button v-for="button in buttons" :key="button.text" :type="button.type" text disabled>
              {{ button.text
              }}
          </el-button>
      </div>
  </template>
  
  ```

  

## 效果

**预览**

[![25ac962c0c448435d5d45e53e1bae80c.md.png](https://s1.imagehub.cc/images/2023/12/16/25ac962c0c448435d5d45e53e1bae80c.md.png)](https://www.imagehub.cc/image/1jjiJS)

**在线编辑**

[![2dc8a80fa22e8a2cb934013930fa4246.md.png](https://s1.imagehub.cc/images/2023/12/16/2dc8a80fa22e8a2cb934013930fa4246.md.png)](https://www.imagehub.cc/image/1jjkmL)

## 致谢

1. 本插件代码参考 element-plus

向以上人员致谢


# 许可

MIT License

# 源码地址
https://github.com/wangziweng7890/monorepo/tree/master/packages/plugins/vuepress2-plugin-demo-block-edit
