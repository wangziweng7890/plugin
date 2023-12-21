import path from 'node:path'
import fs from 'node:fs/promises'
import fse from 'fs-extra'
import axios from 'axios'
import { zip } from 'compressing'
import type { IconfontJson, VitePluginConfig } from './type'
import { listDir, retryPromiseFunctionGenerator } from './utils'

export const getIconJson = retryPromiseFunctionGenerator<IconfontJson['data'], VitePluginConfig>(async (config) => {
  console.log('\x1B[32m%s\x1B[0m', '[vite-plugin-unocss-iconfont]:' + 'start get iconfont json')

  const DOWNLOAD_URL = 'https://www.iconfont.cn/api/project/detail.json'
  const data = await axios.get(DOWNLOAD_URL, {
    headers: {
      cookie: config.cookie,
    },
    timeout: 10 * 1000,
    params: {
      pid: config.pid,
      ctoken: config.ctoken,
    },
  })
  return data.data.data
})

const fetchIonfontZip = retryPromiseFunctionGenerator<any, VitePluginConfig>((config) => {
  console.log('\x1B[32m%s\x1B[0m', '[vite-plugin-unocss-iconfont]:' + 'start download iconfont zip')
  const DOWNLOAD_URL = 'http://www.iconfont.cn/api/project/download.zip'
  return axios.get(DOWNLOAD_URL, {
    responseType: 'stream',
    headers: {
      cookie: config.cookie,
    },
    timeout: 15 * 1000,
    params: {
      pid: config.pid,
      ctoken: config.ctoken,
    },
  })
})

export async function getIconFiles(config: VitePluginConfig): Promise<any> {
  try {
    let res = null
    try {
      res = await fetchIonfontZip(config) // 下载iconfont
    }
    catch (error) {
      console.error('[vite-plugin-unocss-iconfont]:%c请检查cookie， ctoken, pid是否正确:', 'color: red;')
      console.error(error)
      process.exit()
    }
    const tempPath = fse.mkdtempSync('temp-')
    await zip.uncompress(res.data, tempPath) // 解压文件到指定目录并返回目录名
    const zipPath = await listDir(tempPath)
    const filePath = path.join(tempPath, zipPath[0])
    const files = await Promise.all(['iconfont.woff', 'iconfont.woff2', 'iconfont.ttf'].map(async (item) => {
      const data = await fs.readFile(path.join(filePath, item))
      return [item, data]
    }))
    await fse.rm(tempPath, {
      force: true,
      maxRetries: 3,
      retryDelay: 200,
      recursive: true,
    })
    return files
  }
  catch (error) {
    console.error('[vite-plugin-unocss-iconfont]:', error)
    process.exit()
  }
}
