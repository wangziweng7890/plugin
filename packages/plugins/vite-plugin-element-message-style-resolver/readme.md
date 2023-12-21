# vite-plugin-element-message-style-resolver

在jsx和tsx文件中，自动导入el-message,el-message-box 样式

**安装**

```bash
pnpm add -D vite-plugin-element-message-style-resolver
```

**在vite.config.ts中配置**

```ts
// vite.config.ts
import messageResolver from 'vite-plugin-element-message-style-resolver'
//...
plugins: [
	messageResolver()
]
//...
```

**效果**

```js
import { ElMessageBox } from 'element-plus'
```
**转换后**

```js
import { ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/src/base.scss'
import 'element-plus/theme-chalk/src/button.scss'
import 'element-plus/theme-chalk/src/message.scss'
```
