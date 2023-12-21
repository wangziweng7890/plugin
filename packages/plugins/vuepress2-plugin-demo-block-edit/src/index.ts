import { createPage } from '@vuepress/core'
import type MarkdownIt from 'markdown-it'
import { mdPlugin } from './plugins/plugins.js'
import { MarkdownTransform } from './plugins/markdown-transform.js'
import fs from 'fs'
import { HotUpdate } from './plugins/hot-update.js'
import { getDirname, path } from '@vuepress/utils'
const __dirname = getDirname(import.meta.url)


export default function preview2edit() {
    return {
        name: 'code-demo-edit',
        multiple: false,
        alias: {
            '@docs': path.resolve(process.cwd(), 'docs'),
        },
        extendsMarkdown: async (md: MarkdownIt, app) => {
            mdPlugin(md, app)
        },
        onInitialized: async (app) => {
            if (!app.env.isDev) {
                return;
            }
            await Promise.all([
                app.writeTemp('CodeEdit.vue', fs.readFileSync(path.resolve(__dirname, '../public/CodeEdit.vue'))),
                app.writeTemp('Demo.vue', fs.readFileSync(path.resolve(__dirname, '../public/Demo.vue'))),
                app.writeTemp('tempCode.vue', ''),
            ])

            const editPage = await createPage(app, {
                path: '/gedit.html',
                // filePath: path.resolve(__dirname, '../../demo/gedit.md')
                filePath: path.resolve(__dirname, '../public/gedit.md')
            })
            app.pages.push(editPage)
            const previewPage = await createPage(app, {
                path: '/gpreview.html',
                // filePath: path.resolve(__dirname, '../../demo/gpreview.md')
                filePath: path.resolve(__dirname, '../public/gpreview.md')
            })
            app.pages.push(previewPage)
        },
        extendsBundlerOptions: async (bundlerOptions, app) => {
            // 生产模式没有node服务
            if (app.env.isDev) {
                bundlerOptions.viteOptions.plugins.push(MarkdownTransform(app))
                bundlerOptions.viteOptions.plugins.push(HotUpdate(app))
            }
        }
    }
}