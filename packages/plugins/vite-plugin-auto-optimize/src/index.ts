// 预构建package.json中的dependencies依赖以及按需引入的elementui包，防止开发模式下频繁的reloading

import fs from 'node:fs'

type Params = string[] | undefined
export default function (include?: Params, exclude?: Params) {
  return {
    name: 'auto-optimizeDeps',
    async configureServer(server) {
      exclude = exclude || [
        'rc-util',
      ]
      include = include || [
        '@galaxy/swrv/dist/index',
        'lodash-es',
        'element-plus/es',
        'lodash-unified',
      ]
      const json = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`, {
        encoding: 'utf-8',
      }))

      const optimizeDeps = Object.keys(json.dependencies).filter(item => !exclude.includes(item)).concat(include)
      function findElementUi() {
        const arr = []
        const esComponentsFolder = 'element-plus/es/components'
        fs.readdirSync(`node_modules/${esComponentsFolder}`).forEach((dirname) => {
          if (fs.existsSync(`node_modules/${esComponentsFolder}/${dirname}/style`))
            arr.push(`${esComponentsFolder}/${dirname}/style/index`)
        })
        return arr
      }
      const arr = findElementUi()
      server.config.optimizeDeps.include = Array.from(new Set(
        [...(server.config.optimizeDeps.include || []), ...arr, ...optimizeDeps],
      ))
    },
  }
}
