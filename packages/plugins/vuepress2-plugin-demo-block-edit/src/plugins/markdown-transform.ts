import path from 'path'
import glob from 'fast-glob'

import type { Plugin } from 'vite'

type Append = Record<'headers' | 'footers' | 'scriptSetups', string[]>

export function MarkdownTransform(app): Plugin {
    return {
        name: 'galaxy-md-transform',
        enforce: 'pre',
        async transform(code, id) {
            if (!id.includes('pages/component') || !id.endsWith('.vue')) return
            const componentId = path.basename(id, '.html.vue')
            const append: Append = {
                headers: [],
                footers: [],
                scriptSetups: [],
            }

            // code = transformVpScriptSetup(code, append)

            const pattern = `examples/${componentId}/*.vue`
            const compPaths = await glob(pattern, {
                cwd: app.dir.source(),
            });

            append.scriptSetups = compPaths.map((item) => {
                const key = path.basename(item, '.vue');
                return `import ${key} from '@docs/${item}';
            demos['${key}'] = ${key};
        `
            });
            compPaths.length && append.scriptSetups.unshift(`const demos = {}; import Demo from '@temp/Demo.vue'`)

            let newCode = combineMarkdown(
                code,
                [combineScriptSetup(append.scriptSetups), ...append.headers],
                append.footers
            )
            return newCode
        },
    }
}

const combineScriptSetup = (codes: string[]) =>
    `\n<script setup>
${codes.join('\n')}
</script>
`

const combineMarkdown = (
    code: string,
    headers: string[],
    footers: string[]
) => {
    //   const frontmatterEnds = code.indexOf('---\n\n') + 4
    //   const firstSubheader = code.search(/\n## \w/)
    //   const sliceIndex = firstSubheader < 0 ? frontmatterEnds : firstSubheader

    //   if (headers.length > 0)
    //     code =
    //       code.slice(0, sliceIndex) + headers.join('\n') + code.slice(sliceIndex)
    //   code += footers.join('\n')

    return `${code + headers.join('\n')}\n`
}

const vpScriptSetupRE = /<vp-script\s(.*\s)?setup(\s.*)?>([\s\S]*)<\/vp-script>/

const transformVpScriptSetup = (code: string, append: Append) => {
    const matches = code.match(vpScriptSetupRE)
    if (matches) code = code.replace(matches[0], '')
    const scriptSetup = matches?.[3] ?? ''
    if (scriptSetup) append.scriptSetups.push(scriptSetup)
    return code
}

const transformComponentMarkdown = (
    id: string,
    componentId: string,
    code: string,
    append: Append
) => {
    return code
}
