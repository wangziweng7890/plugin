interface VitePluginConfig {
    cookie: string
    pid: string
    ctoken: string
      /**
     * use iconfont mode
     *
     * - `link` - use iconfont by remote link
     * - `file` - use iconfont by downloaded files
     *
     * @default 'link'
     */
    devmodel?: 'link' | 'file'
     /**
     * @default 'file'
     */
    model?: 'link' | 'file'
    /**
     * the font-family of iconfont.css' font-face
     * @default 'iconfont'
     */
    fontFamily?: string
}

interface IconfontJson {
  code: number
  data: {
    updateTime: string
    font: {
      css_font_face_src: string
    }
    project: {
      updated_at: Date
    }
    icons: {
      id: number
      show_svg: string
      name: string
      font_class: string
      unicode: string
    }[]
  }
}
type CustomIconLoader = (name: string) => string | undefined

export { VitePluginConfig, IconfontJson, CustomIconLoader }
