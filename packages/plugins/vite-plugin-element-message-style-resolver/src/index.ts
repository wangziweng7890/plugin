import { type ImportSpecifier, init, parse } from 'es-module-lexer'
import MagicString from 'magic-string'
import { createFilter } from '@rollup/pluginutils'

// 需要在tsx文件中自动引入样式的文件
const options = {
  include: [
    '**/*.tsx',
    '**/*.jsx',
    '**/*.js',
  ],
  exclude: [/[/\\]node_modules[/\\]/, /[/\\]\.git[/\\]/, /[/\\]\.nuxt[/\\]/],
  autoImport: [
    'ElMessageBox',
    'ElMessage',
  ],
}

const prefix = 'El'

const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str: string) =>
  str.replaceAll(hyphenateRE, '-$1').toLowerCase()

const multilineCommentsRE = /\/\*\s(.|[\n\r])*?\*\//gm
const singlelineCommentsRE = /\/\/\s.*/g

function stripeComments(code: string) {
  return code
    .replaceAll(multilineCommentsRE, '')
    .replaceAll(singlelineCommentsRE, '')
}

export const transformImportStyle = (
  specifier: ImportSpecifier,
  source: string,
) => {
  const statement = stripeComments(source.slice(specifier.ss, specifier.se))
  const leftBracket = statement.indexOf('{')
  if (leftBracket > -1) {
    const identifiers = statement.slice(leftBracket + 1, statement.indexOf('}'))
    const components = identifiers.split(',').map(item => item.trim()).filter(item => options.autoImport.includes(item))
    if (components.length === 0) {
      return
    }
    const styleImports: string[] = [
      'import \'element-plus/theme-chalk/src/base.scss\'',
      'import \'element-plus/theme-chalk/src/button.scss\'',
    ]
    components.forEach((c) => {
      const trimmed = c.replace(/\sas\s.+/, '').trim()
      if (trimmed.startsWith(prefix)) {
        const component = trimmed.slice(prefix.length)
        styleImports.push(
          `import 'element-plus/theme-chalk/src/${hyphenate(
            component,
          )}.scss'`,
        )
      }
    })
    return styleImports.join('\n')
  }
}

export const transformStyle = async (source: string, id: string) => {
  if (!source)
    return

  await init

  const specifiers = parse(source)[0].filter((a) => {
    return (
      ['element-plus'].includes(a.n)
    )
  })
  if (specifiers.length === 0)
    return
  const styleImports = specifiers
    .map((s) => {
      const ret = transformImportStyle(s, source)
      return ret
    })
    .filter(s => s)
    .join('\n')
  if (styleImports.length === 0) {
    return
  }
  const lastSpecifier = specifiers.at(-1)!
  console.log(`[element-style-resolver]已为您的文件[${id}]自动引入以下样式`, styleImports)
  const s = new MagicString(source)
  s.appendLeft(lastSpecifier.se + 1, `\n${styleImports}\n`)

  return {
    code: s.toString(),
    get map() {
      return s.generateMap({ hires: true, includeContent: true })
    },
  }
}

export default function () {
  const filter = createFilter(options.include, options.exclude)
  return {
    name: 'vite-plugin-element-message-resolve',
    enforce: 'post',

    transform(source, id) {
      if (filter(id) && !id.includes('.vue')) {
        return transformStyle(source, id)
      }
    },
  }
}
