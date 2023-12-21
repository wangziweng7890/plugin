import { type Plugin } from 'vite'
import type { CustomIconLoader, VitePluginConfig } from './type'
import { getIconFiles, getIconJson } from './download'
import { generateCss } from './build'

let iconMap: Map<string, string>
const virtualModuleId = 'virtual:iconfont'
const resolvedVirtualCss = 'virtual-iconfont.css'

export function FileSystemIconLoader(transform?: (svg: string) => string): CustomIconLoader {
  return (name) => {
    return transform ? transform(iconMap.get(name)) : iconMap.get(name)
  }
}

export default function (config: VitePluginConfig): Plugin {
  const options: VitePluginConfig = Object.assign({
    devmodel: 'link',
    model: 'file',
    fontFamily: 'iconfont',
  }, config)

  let viteConfig
  let model = ''
  let iconfontJson
  let iconSrc = ''

  return {
    name: 'unocss-iconfont',
    enforce: 'pre',
    async configResolved(_viteConfig) {
      model = _viteConfig.command === 'build' ? options.model : options.devmodel
      viteConfig = _viteConfig
    },
    async buildStart() {
      iconfontJson = (await getIconJson(options))
      iconfontJson.updateTime = new Date(iconfontJson.project.updated_at).getTime()
      iconMap = new Map(iconfontJson.icons.map((icon) => {
        return [icon.name, icon.show_svg]
      }))
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualCss
      }
    },
    async load(id) {
      if (id === resolvedVirtualCss) {
        if (model === 'file') {
          const iconFiles = await getIconFiles(options)
          iconFiles.forEach(([name, code]) => {
            this.emitFile({
              type: 'asset',
              fileName: name.replace('.', `-${iconfontJson.updateTime}.`),
              source: code,
            })
          })
        }
        else {
          iconSrc = iconfontJson.font.css_font_face_src
        }
        const iconCss = await generateCss(options, iconfontJson, iconSrc, viteConfig.base ?? '/')
        return iconCss
      }
      return null
    },

  }
}
