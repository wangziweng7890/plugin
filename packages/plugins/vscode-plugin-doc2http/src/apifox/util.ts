// @ts-nocheck

import { pinyin } from 'pinyin-pro'
import { pathExists, mkdir, writeFile, readFile } from 'fs-extra'
import * as babelParser from '@babel/parser'
import * as traverse from '@babel/traverse'
import * as generate from '@babel/generator'
import * as t from '@babel/types'
import * as prettier from 'prettier'

import type { AxiosInstance } from 'axios'
import { FileType } from 'vscode'
import { upath } from '../core'
import logger from '../logger'
import { reportError } from '../helper/error'

export interface ApiFoxIdItem {
  name: string
  parentId: number
  type: FileType
  id: number
  fspath: string
  sort: number
}
export interface ApiFoxIdMap {
  [prop: string]: ApiFoxIdItem
}

export type ApiList = {
  folderId: number
  id: number
  method: 'post' | 'get' | 'put' | 'delete'
  name: string
  path: string
}[]

export type FolderList = {
  id: number
  path: string
  pathArrEn: []
  pathArr: []
  nameEn: string
  name: string
}[]
export interface ApiDetail {
  id: string
  name: string
  method: string
  folderId
  parameters?: {
    query: []
  }
  requestBody?: {
    type: string
    parameters: {}
    jsonSchema: {}
  }
  responses?: {
    code: number
    jsonSchema: {}
  }[]
}

export interface ApiDetails {
  [propname: number]: ApiDetail
}
/** 首字母大写 */
export const firstToLocaleUpperCase = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** 中文转拼音 */
export const cnToPinyin = (cn) => {
  const pyArr = pinyin(cn, { toneType: 'none', type: 'array' })
  let isFirstOne = true
  const pyArr2 = pyArr.map((item, index) => {
    if (isFirstOne) {
      isFirstOne = false
      return item
    }
    if (item === '/') {
      isFirstOne = true
    }
    return firstToLocaleUpperCase(item)
  })
  return pyArr2.join('')
}

export const fetchApiDetails = async (http: AxiosInstance): Promise<ApiDetails> => {
  const apiDetailsUrl = '/api/v1/api-details'
  let resArr = []
  try {
    const res = await http.get(apiDetailsUrl)
    resArr = res.data?.data || []
  } catch (err) {
    logger.error(`fetch apifox url ${apiDetailsUrl} error`, err)
    reportError(err)
  }
  const obj = {}
  resArr.forEach((item) => {
    obj[item.id] = item
  })
  return obj
}

export const fetchFolderList = async (http: AxiosInstance): Promise<{ folderList: FolderList, apiList: ApiList, apiFoxIdMap: ApiFoxIdMap }> => {
  const apiTreeList = '/api/v1/api-tree-list'
  const folderList = []
  const apiList = []
  const apiFoxIdMap = {}
  try {
    const res = await http.get(apiTreeList)
    const folderArr = res.data?.data || []
    const index = 0
    flattenFolders(folderArr, [], [], folderList, apiList, apiFoxIdMap, index)
  } catch (err) {
    logger.error(`fetch apifox url ${apiTreeList} error`, err)
    reportError(err)
  }
  return { folderList, apiList, apiFoxIdMap }
}

export function flattenFolders(arr, pathArrEn, pathArr, folderList, apiArr, allMap, index) {
  for (const item of arr) {
    if (item.type !== 'apiDetailFolder') {
      allMap[item.api.id] = {
        name: item.name,
        parentId: item.api.folderId,
        type: FileType.File,
        id: item.api.id,
        fspath: String(item.api.id),
        sort: index++,
      }
      apiArr.push({ ...item.api })
      continue
    }
    allMap[item.folder.id] = {
      name: item.name,
      parentId: item.folder.parentId,
      type: FileType.Directory,
      id: item.folder.id,
      fspath: String(item.folder.id),
      sort: index++,
    }
    const _pathArrEn = pathArrEn.concat(cnToPinyin(item.name))
    const path = _pathArrEn.join('/')
    const resItem = {
      path,
      pathArrEn: _pathArrEn,
      pathArr: pathArr.concat(item.name),
      nameEn: cnToPinyin(item.name),
      name: item.name,
      ...item.folder,
    }
    folderList.push(resItem)
    flattenFolders(
      item.children,
      resItem.pathArrEn,
      resItem.pathArr,
      folderList,
      apiArr,
      allMap,
      index,
    )
  }
}

const getApiFileImportContent = (deep) => {
  const relativePath = deep === 0 ? './' : '../'.repeat(deep)
  return `/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable vue/no-irregular-whitespace */
/* eslint-disable sort-imports */
import qs from 'qs'
import type { IConfig } from '@galaxy/swrv'
import type { AxiosRequestConfig } from 'axios'
import http from '${relativePath}http'
import { useMutation, useSWRGet } from '${relativePath}swrv'
import {} from './interface'`
}

export const generateFolders = async (folderList, parentDir) => {
  if (await pathExists(parentDir)) {
    await mkdir(parentDir, { recursive: true })
  }
  const resArr = []
  for (const item of folderList) {
    const itemDirPath = upath.join(parentDir, item.path).replace(/[\r\n\t\s]/g, '') // 过滤掉名字中的空白字符
    await mkdir(itemDirPath, { recursive: true })
    const interfacesContentPath = upath.join(itemDirPath, 'interface.ts')
    const apiFunPath = upath.join(itemDirPath, 'apifox.ts')
    const headerCodeOfApifoxTs = getApiFileImportContent(item.pathArr.length + 1)

    const _item = { ...item }
    _item.interfacesContentPath = interfacesContentPath
    _item.apiFunPath = apiFunPath
    _item.interfacesContent = ''
    _item.swrvContent = ''
    _item.axiosContent = ''
    _item.headerCodeOfApifoxTs = headerCodeOfApifoxTs
    resArr.push(_item)
  }
  return resArr
}

// 生成文件内容
export const generateFileContentByFolder = async (item, type) => {
  try {
    // 新增的interface内容
    const interfacesContentPath = item.interfacesContentPath
    const interfacesContent = item.interfacesContent
    // 地址
    const apiFunPath = item.apiFunPath
    // apifox.ts 头部
    const headerCodeOfApifoxTs = item.headerCodeOfApifoxTs
    // axios 内容
    const axiosContent = item.axiosContent
    // swrv 内容
    const swrvContent = item.swrvContent
    if (swrvContent.length === 0 && axiosContent.length === 0) {
      return
    }
    await writeInterfaceIntoFile(interfacesContentPath, interfacesContent)
    const content = type === 'axios' ? axiosContent : swrvContent
    await writeAxiosIntoFile(content, apiFunPath, headerCodeOfApifoxTs, interfacesContent)
  }
  catch (error) {
    logger.error('generateFileContentByFolder error', error)
    reportError(error)
  }
}

// 更新interface.ts 文件
async function writeInterfaceIntoFile(interfacesContentPath, interfacesContent) {
  let code = ''
  if (await pathExists(interfacesContentPath)) { // 如果文件不存在
    code = await readFile(interfacesContentPath, 'utf-8')
  }
  const ast = parse(code)
  traverse.default(ast, {
    // 新增方法
    exit(path) {
      if (path.node.sourceType === 'module') { // 说明是整个文件入口
        const newNodes = parse(interfacesContent).program.body
        path.node.body.forEach((node, index) => { // 替换原来的节点
          const i = newNodes.findIndex(item => item.declaration.id.name === node.declaration.id.name)
          const newNode = newNodes[i]
          if (newNode) {
            path.node.body.splice(index, 1, newNode)
            newNodes.splice(i, 1)
          }
        })
        // 添加新增节点到文件末尾
        path.node.body.push(...newNodes)
      }
    },
  })
  const newCode = await prettierCode(generateCode(ast))
  await writeFile(interfacesContentPath, newCode.replace(/(\r\n|\n|\r)*export/gm, '\n\nexport').trimStart())
}

// 更新apifox.ts 文件夹
async function writeAxiosIntoFile(content, contentPath, preCode, interfacesContent) {
  let code = preCode
  if (await pathExists(contentPath)) {
    code = await readFile(contentPath, 'utf-8')
  }
  const ast = parse(code)
  const newNodes = parse(content)?.program?.body ?? []
  traverse.default(ast, {
    // 更新导入的interface
    ImportDeclaration(path) {
      if (path.node.source.value === './interface') {
        const oldSpecifiers = path.node.specifiers.map(item => item.local.name)
        path.node.specifiers = []
        const newSpecifiers = parse(interfacesContent).program.body.map(item => item.declaration.id.name).filter(item => ['Res', 'Req', 'Query'].some(key => item.endsWith(key)))
        Array.from(new Set([...oldSpecifiers, ...newSpecifiers])).forEach(specifier => path.node.specifiers.push(t.identifier(specifier)))
      }
    },
    // 更新导出的方法
    ExportDeclaration(path) {
      const i = newNodes.findIndex(item => isSame(path.node, item))
      const newNode = newNodes[i]
      if (newNode) {
        // 不知道为啥有的注释移除不掉，所以目前解决方案是通过正则在去除一次
        // t.removeComments(path.node)
        // path.node?.leadingComments?.splice?.(0, path.node?.leadingComments?.length - 1)

        // 直接这么写在转换const 为 function时报错，原因未知
        // 1 path.insertBefore([newNode])
        // path.remove()
        // 2 path.replaceWith(newNode)

        // 尝试了多种方案，后放弃，随采用以下方案
        const index = path.parent.body.findIndex(item => isSame(newNode, item))
        path.parent.body.splice(index, 1, t.cloneDeepWithoutLoc(newNode))
        newNodes.splice(i, 1)
      }
      // if (path.getAllNextSiblings()?.length === 0) {
      //   path.insertAfter(newNodes)
      // }
    },
    // 将剩余新增节点插入，并更新注释
    exit(path) {
      if (path.node.sourceType === 'module') { // 说明是整个文件入口
        // 添加新增节点到文件末尾
        path.node.body.push(...newNodes)
        newNodes.splice(0)
        path.node.body.forEach(node => node.trailingComments = null)
      }
    },
  })
  // .replace(/\/\*\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/(?!\s*export)/g,'') // 去除多余注释
  const newCode = await prettierCode(generateCode(ast))
  await writeFile(contentPath, newCode
    .replace(/(\r\n|\n|\r)+\/\*\*/gm, '\n\n\/\*\*') // 去除多余空格
    .trimEnd() + '\n' // 保持结尾换行
  )
}

// 控制export方法进行换行，如果没有，则新加空行
async function prettierCode(code) {
  const newCode = await prettier.format(code, {
    parser: 'typescript',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
  })
  return newCode
}

// 从从新构建节点
function generateCode(ast) {
  return generate.default(ast, {
  }).code
}

// 判断两个节点是否相等
function isSame(node1, node2) {
  return Object.keys(t.getBindingIdentifiers(node1))[0] === Object.keys(t.getBindingIdentifiers(node2))[0]
}

// 转换
function parse(code, options = {}) {
  return babelParser.parse(code, {
    plugins: ['typescript'],
    sourceType: 'module',
    attachComment: true,
    ...options,
  })
}
