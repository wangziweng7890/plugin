# vite-plugin-unocss-iconfont

// 自动处理iconfont，防止多人开发冲突

**安装**

```bash
pnpm add -D vite-plugin-unocss-iconfont
```

**在vite.config.ts中配置**

```ts
// vite.config.ts
import iconfontLoader, { FileSystemIconLoader } from 'vite-plugin-unocss-iconfont'
//...
plugins: [
  // 以下参数可从iconfont官网接口的请求头中获取，用来请求iconfont配置
	iconfontLoader({
     cookie: '', 
     pid: '',
     ctoken: '',
     fontFamily: 'iconfont' // iconfont 的 font-family, 可修改成其它的，防止和项目中其它iconfont冲突
  })
]
//...
```

**在项目入口ts文件中配置**

```ts
// main.ts
import 'virtual:iconfont'
```

**进阶使用，以svg的形式使用iconfont(完全按需，推荐)**

```ts
// vite.config.ts
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'vite-plugin-unocss-iconfont'

// ...
plugins: [
	Icons({
      customCollections: {
          font: FileSystemIconLoader(svg => svg),
      },
  }),
  AutoImport({
    resolvers: [
      {
        IconsResolver({
          prefix: 'Icon',
          customCollections: ['font'],
        }),
      }
    ]
  }),
  Components({
    resolvers: [
      {
        IconsResolver({
          prefix: 'Icon',
          customCollections: ['font'],
        }),
      }
    ]
  })
]
```

**在业务中使用**
```vue
<template>
  <icon-font-{你的iconfont图标名称}>
</template>
```
