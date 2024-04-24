// 自动生成组件文档目录

/**
 * 为什么不用 https://vue-styleguidist.github.io/docs/docgen-cli.html#install 而自己造轮子？
 * 1.如果目标MD文件已存在，没有配置决定是否覆盖生成还是增量生成
 * 2.没有md内容提取策略 (contentStrategy)
 * 3.单文件提取不友好
 * */

const path = require('node:path')
const os = require('node:os')
const fs = require('fs-extra')
const { parse } = require('vue-docgen-api') // 引入资源包
const json2md = require('json2md')
const glob = require('glob')
const { program } = require('commander')

program.option('-t --target [p]', '目标文件绝对路径')
program.option('-r --readDir [p]', '默认读取的组件路径')
program.option('-m --mdname [p]', '生成的md文件名')
program.option('-o --override', '如有同名文件，是否覆盖')
program.option('-d --outDir [p]', '默认生成md文件所放目录')
program.option('-e --exampleDir [p]', 'vue demo文件路径')

// 去除换行符
function text2rn(text) {
  if (text && text.replace) {
    return text.replace(/\r\n/g, '')
  }
  return text === undefined ? '' : text
}

function transformFirstChart(str, flag = true) {
  const fn = flag ? 'toUpperCase' : 'toLowerCase'
  return str.slice(0, 1)[fn]() + str.slice(1)
}

// 获取vue文件数据
async function getData(name, paths) {
  const arr = []
  for (const index in paths) {
    const result = await parse(paths[index]) // 异步加载需要解析的vue的文件
    arr.push(result)
  }
  return json2Md(name, arr)
}

// 创建MD内容
function json2Md(name, jsons) {
  const flag = jsons.length > 1
  const arr = [
    { h1: name },
    {
      p: `:::demo
${Config.getDocFileName(name)}/basic
:::`,
    },
  ]
  jsons.forEach((data) => {
    const prefix = flag ? `${data.displayName} ` : ''
    data.description && arr.push({ blockquote: data.description })
    data.props
      && arr.push(
        ...[
          { h2: `${prefix}Props` },
          {
            table: {
              headers: ['参数', '说明', '类型', '可选值', '默认值'],
              rows: data.props?.map((prop) => {
                return [
                  prop.name,
                  prop.description || '',
                  prop.type?.name || '',
                  '',
                  JSON.stringify(text2rn(prop.defaultValue && prop.defaultValue.value)),
                ]
              }) || [],
            },
          },
        ],
      )
    data.events
      && arr.push(
        ...[
          {
            h2: `${prefix}Events`,
          },
          {
            table: {
              headers: ['事件名', '说明', '参数'],
              rows: data.events.map((event) => {
                return [event.name, '', JSON.stringify(text2rn(event.properties?.map(item => item).join('')))]
              }),
            },
          },
        ],
      )
    data.methods
      && arr.push(
        ...[
          {
            h2: `${prefix}Methods`,
          },
          {
            table: {
              headers: ['方法名', '说明', '参数'],
              rows: data.methods.map((method) => {
                return [method.name, method.description || '', '']
              }),
            },
          },
        ],
      )
    data.slots
      && arr.push(
        ...[
          {
            h2: `${prefix}Slots`,
          },
          {
            table: {
              headers: ['name', '说明', '参数'],
              rows: data.slots.map((slot) => {
                return [
                  slot.name,
                  slot.description || '',
                  JSON.stringify(
                    (slot.bindings
                      && slot.bindings.map((binding) => {
                        return text2rn(binding.name)
                      }))
                      || '',
                  ),
                ]
              }),
            },
          },
        ],
      )
    data.expose && arr.push(
      ...[
        {
          h2: `${prefix}Expose`,
        },
        {
          table: {
            headers: ['方法名', '说明', '参数'],
            rows: data.expose.map((expose) => {
              return [expose.name, expose.description || '', '']
            }),
          },
        },
      ],
    )
  })
  return json2md(arr)
}

// 创建MD文件
function createMd(name, content, outDir) {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(outDir, `${name}.md`)
    fs.writeFile(path.resolve(filePath), content, {}, (error) => {
      if (error) {
        return reject(new Error(`[生成${name}.md失败]: ${error}`))
      }
      return resolve(name)
    })
  })
}

// 创建实例vue文件
function createExample(name, outDir, fileName) {
  const newName = transformFirstChart(name)
  const content = `<script lang="tsx" setup>
import ${newName} from '@/components/${newName}/${newName}.vue'
</script>

<template>
    <div>
       <${newName} />
    </div>
</template>`
  return new Promise(async (resolve, reject) => {
    const filePath = path.resolve(outDir, `${fileName}/basic.vue`)
    try {
      await fs.outputFileSync(path.resolve(filePath), content)
      return resolve(name)
    }
    catch (error) {
      reject(new Error(`[生成${name}.vue失败]: ${error}`))
    }
  })
}

function isUndefined(value) {
  return value === undefined
}
// 初始化
async function init(userConfig = {}) {
  console.log('开始生成MD文档, 请稍等片刻')
  const options = program.opts()
  Object.assign(Config, userConfig)
  Config.components = isUndefined(options.target) ? Config.components : path.resolve(process.cwd(), options.target).replace(/\\/g, '/')
  Config.componentsRoot = isUndefined(options.readDir) ? Config.componentsRoot : path.resolve(process.cwd(), options.readDir)
  Config.override = isUndefined(options.override) ? Config.override : options.override
  Config.iExample = isUndefined(options.iExample) ? Config.iExample : options.iExample
  Config.outDir = isUndefined(options.outDir) ? Config.outDir : path.resolve(process.cwd(), options.outDir)

  const globConfig = {
    cwd: Config.componentsRoot,
    ignore: Config.ignore,
  }
  if (os.type() == 'Windows_NT') {
    // windows平台
    globConfig.root = Config.componentsRoot
  }
  glob(
    Config.components,
    globConfig,
    async (err, files) => {
      if (err) {
        console.log('[componentsRoot]: 查找组件失败', err)
        return
      }
      files = files.map((item) => {
        if (path.isAbsolute(item)) {
          return path.relative(Config.componentsRoot, item)
        }
        return item
      })
      const filePaths = await getFileNoExists(getFileToMd(files), Config.outDir)
      const res = await Promise.allSettled(
        filePaths.map(async ([name, contentPaths]) => {
          try {
            const content = await getData(
              name,
              contentPaths.map(dir => path.resolve(Config.componentsRoot, dir)),
            )
            return createMd(Config.getDocFileName(name), content, Config.outDir).then(async () => {
              if (Config.iExample) {
                await createExample(name, Config.exampleDir, Config.getDocFileName(name))
              }
              return Config.getDocFileName(name)
            })
          }
          catch (error) {
            console.log(error)
          }
        }),
      )
      const allfile = res.filter(item => item.status === 'fulfilled').map(item => item.value)
      console.log(
        '[成功生成以下MD文件]：',
        allfile.map((item) => { return { title: item, path: `/components/${item}.md` } }),
      )
    },
  )
}

// 策略方法
const swichContentStrategy = {
  index(key, value) {
    const flag = value.find(item => item.includes('index.vue'))
    return flag ? [flag] : null
  },
  component(key, value) {
    const flag = value.find(item => item.includes(`${key}.vue`))
    return flag ? [flag] : null
  },
  all(key, value) {
    return value
  },
}

// 判断该文件是否存在
async function getFileNoExists(files, outDir) {
  if (Config.override) return files
  const arr = []
  await Promise.all(
    files.map(([name, contentPath]) => {
      return new Promise((resolve, reject) => {
        const filePath = path.resolve(outDir, `${Config.getDocFileName(name)}.md`)
        fs.access(filePath, async (err) => {
          if (err) {
            arr.push([name, contentPath])
          }
          resolve()
        })
      })
    }),
  )
  return arr
}

// 根据策略收集需要转换的VUE文件，并分组
function getFileToMd(files) {
  const mapC = new Map()
  files.forEach((file) => {
    const key = getRootDir(file)
    const arr = mapC.get(key) || []
    arr.push(file)
    mapC.set(key, arr)
  });
  [...mapC.entries()].forEach(([key, value]) => {
    Config.contentStrategy.some((contentStrategy) => {
      const result = swichContentStrategy[contentStrategy](key, value)
      if (result) {
        mapC.set(key, result)
        return true
      }
    })
  })
  return [...mapC.entries()]
}

// 获取根文件夹 例如传参 '/a/b/c' , 返回 'a'
function getRootDir(componentPath) {
  let str = componentPath
  while (path.dirname(str) !== '.') {
    str = path.dirname(str)
  }
  return str
}
/**
 * md内容提取策略
 *
 * 组件文档结构存在下面的场景
 *
 * -packages
 *   -table
 *      -src
 *         -table.vue
 *         -filter-panel.vue
 *  -addBtn
 *      -index.vue
 *  -edit
 *      -src
 *         -InlineEdit.vue
 *         -SwichEdit.vue
 *  -fileList
 *      -file.vue
 *      -index.vue
 *
 * 即一个组件文件夹下可能多个vue文件，或者只有一个vue文件
 * 对于一个vue文件，我们直接提取里面内容, 或者不提取
 * 对于多个vue文件，我们需要制定策略，需要提取index.vue还是{component}.vue,又或者是提取全部vue文件内容到一个md中
 *
 * 默认策略如下
 * index: index.vue
 * compenent: 同名component.vue
 * all: 在此如果都没有，则提取所有vue文件
 */
const contentStrategy = ['index', 'component', 'all']

// 配置，暴露给用户使用
const Config = {
  contentStrategy,
  componentsRoot: path.resolve('src/components'),
  components: '**/*.vue',
  outDir: path.resolve('docs/component'),
  exampleDir: path.resolve('docs/examples'),
  ignore: [''],
  override: false, // 是否覆盖已有的md文件
  iExample: true, // 是否生成vue demo文件
  getDocFileName(componentPath) {
    const str = getRootDir(componentPath)
    return str.replace(/[A-Z]/g, (march, g1, g2) => {
      if (g1 === 0) {
        return march.toLowerCase()
      }
      return `-${march.toLowerCase()}`
    })
  },
}

module.exports = init
