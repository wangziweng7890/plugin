import logger from '../logger'
import { upath } from '../core'
import {
  firstToLocaleUpperCase,
  generateFolders,
} from './util'

export async function getTaskList(options, folderList, choicesApis, choicesFolderIds, apiDetails) {
  const prefixPath = options.prefixPath || ''
  const distPath = options.baseDir
  const apiRepeatMap = new Map()

  /** 不管type是什么都过滤到folderList ， type==='api'时只有一项 */
  folderList = folderList.filter(item => choicesFolderIds.includes(item.id))

  folderList = await generateFolders(folderList, distPath)
  choicesApis.forEach((id) => {
    const item = apiDetails[id]
    let path = item.path
    const method = item.method
    if (path === '' || path === '/') {
      logger.warn(`非法 path: ${method}-${path}`)
      return
    }
    if (!/^\/[a-zA-A0-9\/]+/.test(path)) {
      logger.warn(`非法 path: ${method}-${path}`)
      return
    }
    // 加上path前缀
    path = upath.join(prefixPath, path)
    const folderId = item.folderId
    const folderInfo = folderList.find(item => item.id === folderId)
    if (!folderInfo) {
      logger.warn(`未找到文件夹-非法 path: ${method}-${path}`)
      return
    }

    const query = item.parameters?.query || []
    /** 找重复 start  */
    const mapKey = `${method}${path}`
    if (apiRepeatMap.has(mapKey)) {
      apiRepeatMap.set(mapKey, apiRepeatMap.get(mapKey) + 1)
    }
    else {
      apiRepeatMap.set(mapKey, 1)
    }
    /** 找重复 end */
    const name = item.name
    let apiName
    if (apiRepeatMap.get(mapKey) === 1) {
      apiName = generateApiName(path, method)
    }
    else {
      return
      // apiName = generateApiName(path + apiRepeatMap.get(mapKey), method);
    }
    // get parameters-query
    const queryParams = handleParametersType(query, apiName)
    if (queryParams) {
      folderInfo.interfacesContent += `export interface ${apiName}Query {
    ${queryParams}
}
`
    }
    if (HasReqBodyMethods.includes(method)) {
      const requestBody = item.requestBody
      // "type": "application/x-www-form-urlencoded" | 'multipart/form-data' | "application/json"
      const requestBodyType = requestBody.type
      if (ParamsTypes.includes(requestBodyType)) {
        const reqBodyParams = handleParametersType(requestBody.parameters)
        if (reqBodyParams) {
          folderInfo.interfacesContent += `export interface ${apiName}Req {
    ${reqBodyParams}
}
`
        }
        else {
          folderInfo.interfacesContent += `export interface ${apiName}Req {}`
        }
      }
      else if (JsonTypes.includes(requestBodyType)) {
        const interfaceArr = []
        handleJsonType(requestBody.jsonSchema, `${apiName}Req`, interfaceArr)
        interfaceArr.forEach((item) => {
          folderInfo.interfacesContent += item
        })
      }
      else {
        // 其他类型 比如raw 类型，// 没有例子 暂不支持
        const interfaceArr = []
        handleJsonType({}, `${apiName}Req`, interfaceArr)
        interfaceArr.forEach((item) => {
          folderInfo.interfacesContent += item
        })
      }
    }

    /** ------ 处理response ------ */
    const response = item?.responses?.find(response => response.code === 200)
    const jsonSchema = response?.jsonSchema || {}
    const resInterfaceArr = []
    const refs = jsonSchema['x-apifox-refs'] || {}
    /** 有两种形式的数据结构 */
    if (Object.keys(refs).length > 0) {
      // 外层直接拿到内层的data作为`${apiName}Res` 所以handleJsonRefsType方法先废弃掉
      // handleJsonRefsType(jsonSchema, `${apiName}Res`, resInterfaceArr);
      const propertyKeys = Object.keys(jsonSchema?.properties || {})
      const orders = jsonSchema['x-apifox-orders'] || []
      const refs = jsonSchema['x-apifox-refs'] || {}
      // eg: 01GVM1TR3Y1XF8M6HVFVFZC6VV 现在只发现有一个 也就是 refsInnerKeys 只有一项
      const refsInnerKeys = orders.filter(
        item => !propertyKeys.includes(item),
      )
      const innerRefObj = refs[refsInnerKeys[0]]
      if (
        innerRefObj
        && innerRefObj['x-apifox-overrides']
        && innerRefObj['x-apifox-overrides'].data
      ) {
        const dataSchema = innerRefObj['x-apifox-overrides'].data
        handleJsonType(dataSchema, `${apiName}Res`, resInterfaceArr)
      }
    }
    else {
      let resDataJsonSchema
      if (
        jsonSchema.properties?.code?.type === 'integer'
        && (jsonSchema.properties?.message?.type === 'string' || jsonSchema.properties?.msg?.type)
      ) {
        // 直接取res.data, 因为res.code和res.message是固定的结构
        resDataJsonSchema = jsonSchema.properties?.data || {}
      }
      else {
        // 有些api response 定义没有包含res.code和res.message 直接定义了返回的data
        resDataJsonSchema = jsonSchema || {}
      }
      handleJsonType(resDataJsonSchema, `${apiName}Res`, resInterfaceArr)
    }
    resInterfaceArr.forEach((item) => {
      folderInfo.interfacesContent += item
    })

    /** ------ 生成api function start ------ */
    const prefixPath2 = (`/${path}`).replace(/^\/+/, '/')

    if (method === 'get') {
      if (queryParams) {
        folderInfo.swrvContent += `
/** swrv ${name} */
export function use${apiName}(params: ${apiName}Query | Ref<${apiName}Query>, swrvConfig: IConfig = {}) {
    const computedParams = computed(() => qs.stringify(unref(params)))
    return useSWRGet<${apiName}Res>(() => computedParams.value && \`${prefixPath2}?\$\{computedParams.value\}\`, swrvConfig)
}
`

        folderInfo.axiosContent += `
/** axios ${name} */
export function ${apiName}(params: ${apiName}Query, axiosConfig: AxiosRequestConfig = {}): Promise<${apiName}Res> {
  return http.get('${prefixPath2}', { params, ...axiosConfig })
}
`
      }
      else {
        folderInfo.swrvContent += `
/** swrv ${name} */
export function use${apiName}(swrvConfig: IConfig = {}) {
  return useSWRGet<${apiName}Res>('${prefixPath2}', swrvConfig)
}
`
        folderInfo.axiosContent += `
/** axios ${name} */
export function ${apiName}(params: any = {}, axiosConfig: AxiosRequestConfig = {}): Promise<${apiName}Res> {
  return http.get('${prefixPath2}', { params, ...axiosConfig })
}
`
      }
    }
    else if (method === 'delete') {
      // 增加useDeleteXXXX
      folderInfo.swrvContent += `
/** swrv ${name} */
export function use${apiName}(axiosConfig?: AxiosRequestConfig) {
  return useMutation<${apiName}Res, ${apiName}Query>(${apiName}, axiosConfig)
}
`
      const temp = `
/** axios ${name} */
export function ${apiName}(params: ${apiName}Query, axiosConfig: AxiosRequestConfig = {}): Promise<${apiName}Res> {
    return http.delete('${prefixPath2}', { params, ...axiosConfig })
}
`
      folderInfo.swrvContent += temp // delete,put,post生成swrv的时候同时也会生成axios请求，
      folderInfo.axiosContent += temp
    }
    else if (HasReqBodyMethods.includes(method)) {
      if (item.requestBody.type !== 'none') {
        const temp = `
/** axios ${name} */
export function ${apiName}(params: ${apiName}Req, axiosConfig: AxiosRequestConfig = {}): Promise<${apiName}Res> {
    return http.${method}('${prefixPath2}', params, axiosConfig)
}
`
        // 增加usePostXXXX
        folderInfo.swrvContent += `
/** swrv ${name} */
export function use${apiName}(axiosConfig?: AxiosRequestConfig) {
  return useMutation<${apiName}Res, ${apiName}Req>(${apiName}, axiosConfig)
}
`
        folderInfo.swrvContent += temp // delete,put,post生成swrv的时候同时也会生成axios请求，
        folderInfo.axiosContent += temp
      }
      else {
        // 没有 requestBody
        const temp = `
/** axios ${name} */
export function ${apiName}(params: any = {}, axiosConfig: AxiosRequestConfig = {}): Promise<${apiName}Res> {
    return http.${method}('${prefixPath2}', params, axiosConfig)
}
`
        // 增加usePostXXXX
        folderInfo.swrvContent += `
/** swrv ${name} */
export function use${apiName}(axiosConfig?: AxiosRequestConfig) {
  return useMutation<${apiName}Res>(${apiName}, axiosConfig)
}
`
        folderInfo.swrvContent += temp // delete,put,post生成swrv的时候同时也会生成axios请求，
        folderInfo.axiosContent += temp
      }
    }
    /** ------ 生成api function end ------ */
  })

  return folderList
}

/** *************************工具函数**********************/

const ParamsTypes = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
]
const JsonTypes = ['application/json']
const HasReqBodyMethods = ['post', 'put', 'patch', 'delete']

/** 处理一些字段名命名不规范的问题 eg: effective_time[] 这种带中括号，或者以数字开头  */
const handleKeyName = function (name) {
  //   const reg = new RegExp(/^[0-9].*/);
  const reg = /^([^\x00-\xFF]|[a-zA-Z_$])([^\x00-\xFF]|[a-zA-Z0-9_$])*$/

  if (!reg.test(name) && !name.includes('\'')) {
    return `'${name}'`
  }
  else if (!reg.test(name) && name.includes('\'')) {
    return `"${name}"`
  }
  return name
}

/** 出现在query params、requestBody 类型为非application/json
 * 不会出现嵌套object类型 ？？？
 */
const handleParametersType = function (params, apiName = '') {
  let result = ''
  params.forEach((param, index) => {
    const required = param.required
    const description = param.description
    const type = param.type
    const name = param.name
    const example = param.example
    // type==='array' name 会带[] 例如 name: "similar_question[]"
    const _name
      = type === 'array' && name.endsWith('[]') ? name.slice(0, -2) : name
    if (required) {
      result += `/** ${description} example: ${example} */
    ${handleKeyName(_name)}: ${convertTypeOnly(type, example)}`
    }
    else {
      result += `/** ${description}  example: ${example} */
    ${handleKeyName(_name)}?: ${convertTypeOnly(type, param.example)}`
    }
    if (index < params.length - 1) {
      result += `
    `
    }
  })
  return result
}

/**
 * 这个方法先废弃掉
 * @param {*} jsonSchema
 * @param {*} apiName
 * @param {*} interfaceArr
 */
// const handleJsonRefsType = function (jsonSchema, apiName, interfaceArr) {
//   let result = '';
//   if (jsonSchema.type === 'object') {
//     // result += handleJsonType(jsonSchema, apiName);
//     const propertyKeys = Object.keys(jsonSchema?.properties || {});
//     const orders = jsonSchema['x-apifox-orders'] || [];
//     const refs = jsonSchema['x-apifox-refs'] || {};
//     // eg: 01GVM1TR3Y1XF8M6HVFVFZC6VV 现在只发现有一个 也就是 refsInnerKeys 只有一项
//     const refsInnerKeys = orders.filter((item) => !propertyKeys.includes(item));
//     for (let key of refsInnerKeys) {
//       const innerRefObj = refs[key];
//       if (!innerRefObj) continue;
//       const overrides = innerRefObj['x-apifox-overrides'];
//       if (!overrides) continue;
//       const overridesKeys = Object.keys(overrides);
//       for (let overrideKey of overridesKeys) {
//         const innerSchema = overrides[overrideKey];
//         if (!innerSchema) continue;
//         // 目前只发现object类型
//         if (innerSchema?.type === 'object' || innerSchema.type === 'array') {
//           const newApiName = `${apiName}${firstToLocaleUpperCase(overrideKey)}`;
//           result += `
//     ${handleKeyName(overrideKey)}: ${newApiName}`;
//           handleJsonType(innerSchema, `${newApiName}`, interfaceArr);
//         } else {
//           result += `
//     ${handleKeyName(overrideKey)}: ${convertTypeOnly(innerSchema?.type)}`;
//         }
//       }
//     }
//     let resultInterface = `export interface ${apiName} {${result}
// }
// `;
//     interfaceArr?.push(resultInterface);
//   }
// };

/** interfaceArr 不传值的时候就不会push, 用在handleJsonRefsType */
const handleJsonType = function (jsonSchema, apiName, interfaceArr) {
  /** 有些接口 没有定义response data type jsonSchema:{} */
  if (!jsonSchema.type) {
    const result = `
export type ${apiName} = any
`
    interfaceArr?.push(result)
    return result
  }

  if (jsonSchema.type === 'array') {
    const result = `
export type ${apiName} = ${apiName}Item[]
`
    interfaceArr?.push(result)
    handleJsonType(jsonSchema.items, `${apiName}Item`, interfaceArr)
    return result
  }

  if (jsonSchema.type !== 'object') {
    const result = `
export type ${apiName} = ${convertTypeOnly(jsonSchema.type)}
`
    interfaceArr?.push(result)
    return result
  }

  /** jsonSchema.type === 'object' */
  const properties = jsonSchema.properties || {}
  const required = jsonSchema.required
  let result = ''
  for (const key in properties) {
    const property = properties[key]
    if (typeof property.type === undefined) {
      continue
    }
    const description = property.description || ''
    const title = property.title || ''
    if ((required && !required.includes(key)) || property.nullable === true) {
      result += `
    /** ${title} ${description} */
    ${handleKeyName(key)}?: ${convertMyType(
  property,
  key,
  apiName,
  interfaceArr,
)}`
    }
    else {
      result += `
    /** ${title} ${description} */
    ${handleKeyName(key)}: ${convertMyType(
  property,
  key,
  apiName,
  interfaceArr,
)}`
    }
  }
  const resultInterface = `export interface ${apiName} {${result}
}
`
  interfaceArr?.push(resultInterface)
  return result
}

/** 只有一层类型需要处理，无嵌套类型 */
const convertTypeOnly = function (type, example?) {
  // type:["string","null"]
  if (Array.isArray(type)) {
    return type.map(item => `${convertTypeOnly(item)}`).join(' | ')
  }
  let resType = type
  switch (type) {
  case 'integer':
    resType = 'number'
    break
  case 'file':
    resType = 'File'
    break
  case 'array':
    let types = ''
    if (Array.isArray(example)) {
      example.forEach((ex) => {
        const exType = typeof ex
        if (!types.includes(exType)) {
          types += types ? ` | ${exType}` : `${exType}`
        }
      })
    }
    else {
      types = 'any'
    }
    resType = types.includes('|') ? `(${types})[]` : `${types}[]`
    break
  }
  return resType || 'any'
}

/** 处理枚举类型 type: integer | string */
const handleEnumType = (property, enumTypeName, interfaceArr) => {
  const { enum: enums, type, title = '' } = property

  let res = `
/** ${title} */
`
  if (type === 'string') {
    res += `export enum ${enumTypeName}{`
    for (const item of enums) {
      res += `
      ${item} = "${item}",`
    }
    res += `
}
`
  }
  else if (type === 'integer') {
    res += `export type ${enumTypeName} = `
    enums.forEach((item, index) => {
      if (index === 0) {
        res += `${item}`
      }
      else {
        res += ` | ${item}`
      }
    })
    res += `
`
  }
  interfaceArr.push(res)
}

/** 转换类型 */
const convertMyType = function (property, key, preApiName, interfaceArr) {
  // property.type: ["string","null"]
  if (Array.isArray(property.type)) {
    return property.type.map(item => `${convertTypeOnly(item)}`).join(' | ')
  }
  let type = 'unknown'
  switch (property.type) {
  case 'file':
    type = 'File'
    break
  case 'string':
    if (property.enum && Array.isArray(property.enum)) {
      const enumType = preApiName + firstToLocaleUpperCase(key)
      handleEnumType(
        property,
        enumType,
        interfaceArr,
      )
      type = enumType
    }
    else {
      type = 'string'
    }
    break
  case 'boolean':
    type = 'boolean'
    break
  case 'integer':
    if (property.enum) {
      const enumType = preApiName + firstToLocaleUpperCase(key)
      handleEnumType(
        property,
        enumType,
        interfaceArr,
      )
      type = enumType
    }
    else {
      type = 'number'
    }
    break
  case 'number':
    type = 'number'
    break
  case 'array':
    if (property?.items?.type) {
      let itemType = property.items.type
      if (itemType === 'integer') {
        type = 'Array<number>'
      }
      else if (itemType === 'object') {
        const jsonSchema = property.items
        itemType = `${preApiName}${firstToLocaleUpperCase(key)}Item`
        type = `Array<${itemType}>`
        handleJsonType(jsonSchema, itemType, interfaceArr)
      }
      else if (itemType === 'array') {
        // 只处理到这一层了，再往深嵌套就直接any了
        const innerItemType = property?.items?.items?.type || 'any'
        type = `Array<${convertTypeOnly(innerItemType)}[]>`
      }
      else {
        type = `Array<${itemType}>`
      }
    }
    break
  case 'object':
    type = `${preApiName}${firstToLocaleUpperCase(key)}`
    handleJsonType(property, type, interfaceArr)
    break
  default:
    type = property.type
  }
  return type
}

/** 生成API名称 */
function generateApiName(apiUrl, method) {
  // 解析url
  const urlBlock = apiUrl.match(/[/-][a-zA-z0-9]+/g) || []
  const routeParams = apiUrl.match(/\{[a-zA-Z0-9]*\}+/g)
  //   routeParam 用于区别/xxx 和 /xxx/:id 这两种接口的命名
  let routeParam = ''

  if (routeParams) {
    routeParam = firstToLocaleUpperCase(
      routeParams[routeParams.length - 1].replace(/[{|}]/g, ''),
    )
  }

  let apiName = firstToLocaleUpperCase(method)

  urlBlock.forEach((item) => {
    const name = item.slice(1)
    apiName += firstToLocaleUpperCase(name)
  })

  apiName += routeParam ? `_${routeParam}` : ''

  return apiName
}
