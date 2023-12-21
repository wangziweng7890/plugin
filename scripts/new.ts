/**
 * 自动生成插件，组件相关文件
 *
 *
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yargs from 'yargs-parser'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const argv = yargs(process.argv.slice(2))
if (!argv.name) {
  console.error('名称必填: 缺少参数--name=xxxx')
  process.exit(1)
}
if (!argv.type) {
  console.error('类型必填: 缺少参数--type=<plugin | ui>')
  process.exit(1)
}

const pluginPath = path.resolve(__dirname, '../packages/plugins', argv.name)
const pluginFiles = [
  {
    path: path.join(pluginPath, 'package.json'),
    content: `{
  "name": "${argv.name}",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup"
  },
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js",
      "import": "./dist/index.mjs"
    }
  },
  "devDependencies": {
    "tsup": "^7.1.0"
  },
  "author": "",
  "license": "ISC"
}`,
  },
  {
    path: path.join(pluginPath, 'tsconfig.json'),
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "lib": ["es2022"],
    "strict": false,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src"]
}`
  },
  {
    path: path.join(pluginPath, 'tsup.config.ts'),
    content: `import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['src/*.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: true,
})`
  },
  {
    path: path.join(pluginPath, 'src/index.ts'),
    content: ``
  },
  {
    path: path.join(pluginPath, 'src/type.ts'),
    content: ``
  },
  {
    path: path.resolve(process.cwd(), 'site-vitepress/docs/plugins', argv.name + '.md'),
    content: '# vite-plugin-unocss-iconfont\n\n' +

      '// description\n\n' +

      '**安装**\n\n' +

      '```bash\n' +
      `pnpm add -D ${argv.name}\n` +
      '```'
  }
]
const map = {
  plugins: pluginFiles,
  // todo
  // ui: {
  //   files: pluginFiles,
  //   path: pluginPath,
  // }
}

// 创建模板
async function main() {
  await Promise.all(map[argv.type].map(async (file) => {
    await exitsFolder(file.path)
    await fs.promises.writeFile(file.path, file.content)
  }))
  console.log('生成成功!')
}

main()

async function exitsFolder(p) {
  const dir = path.dirname(p)
  try {
    const ret = await fs.promises.stat(dir)
    if (!ret.isDirectory()) {
      await fs.promises.mkdir(dir, { recursive: true })
    }
  }
  catch (error) {
    if (error.code === 'ENOENT')
      await fs.promises.mkdir(dir, { recursive: true })
  }
  finally {
    console.log(dir)
  }
}
