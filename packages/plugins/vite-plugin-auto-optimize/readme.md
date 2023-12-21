# vite-plugin-auto-optimize

// 预构建package.json中的dependencies依赖以及按需引入的elementui包，防止开发模式下切换页面会频繁的reloading
**安装**

```bash
pnpm add -D vite-plugin-auto-optimize
```

**在vite.config.ts中配置**

```ts
// vite.config.ts
import autoOptimize from 'vite-plugin-auto-optimize'
//...
plugins: [
	autoOptimize()
]
//...
```

**如果有想要自定义预购建，或者不用预购建的，可传以下两个参数**
// vite.config.ts
const includes = ['xxxx'];
const excludes = ['xxxxx'];
// ...
plugins: [
	autoOptimize(includes, excludes)
]
**效果**

切换页面路由后不再触发new optimize: reloading
