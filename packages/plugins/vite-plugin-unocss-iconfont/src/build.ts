import type { IconfontJson, VitePluginConfig } from './type'

export function generateCss(config: VitePluginConfig, iconsConfig: IconfontJson['data'], src, base) {
  src = src || `src:
  url("${base}iconfont-${iconsConfig.updateTime}.woff2") format("woff2"),
  url("${base}iconfont-${iconsConfig.updateTime}.woff") format("woff"),
  url("${base}iconfont-${iconsConfig.updateTime}.ttf") format("truetype");`
  let template = `@font-face {
    font-family: ${config.fontFamily};
    ${src}
}

.iconfont {
    font-family: ${config.fontFamily} !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

`
  template += iconsConfig.icons.map((icon) => {
    return `.icon-${icon.font_class}::before {
      content: "${'\\'}${Number.parseInt(icon.unicode).toString(16)}";
  }`
  }).join('\n')
  return template
}
