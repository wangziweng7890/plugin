import { AxiosInstance } from "axios";
import { fetchApiDetails, fetchFolderList, generateFileContentByFolder } from "./util";
import type { ApiFoxIdItem, ApiFoxIdMap, ApiList, FolderList, ApiDetails, ApiDetail } from './util'
import type { Config } from '../modules/config'
import { createHttp } from "./http";
import { getTaskList } from "./create";
import { FileType } from "vscode";
import * as querystring from 'querystring';

import type { TransferTaskOptions } from '../core/transferTask'
export default class ApifoxService {
  private _http: AxiosInstance;
  private _apiDetails: ApiDetails;
  private _config: Config;
  private _apiList: ApiList;
  private _folderList: FolderList;
  private _apiFoxIdMap: ApiFoxIdMap;
  private _detailPromise: Promise<any>
  private _folderPromise: Promise<any>

  constructor(config) {
    this._config = config
    this._http = createHttp(config);
    this._apiDetails = null
    this._apiList = null
    this._folderList = null
  }

  private findFolderAndApi(ids): { choicesFolders: number[]; choicesApis: number[] } {
    if (!ids.length) {
      return {
        choicesFolders: this._folderList.map(item => item.id),
        choicesApis: this._apiList.map(item => item.id),
      }
    }
    let folders = []
    let apis = []
    ids.forEach(id => {
      id = Number(id)
      const detail = this._apiFoxIdMap[id]
      folders.push(detail.type === FileType.Directory ? id : detail.parentId)
      if (detail.type !== FileType.Directory) {
        apis.push(id)
      } else {
        Object.keys(this._apiFoxIdMap).forEach(key => {
          if (this._apiFoxIdMap[key].parentId === id && this._apiFoxIdMap[key].type !== FileType.Directory) {
            apis.push(this._apiFoxIdMap[key].id)
          }
        })
      }

    })
    return {
      choicesFolders: [...new Set(folders)].map(id => parseInt(id)),
      choicesApis: [...new Set(apis)].map(id => parseInt(id))
    }
  }

  async initData() {
    this._detailPromise = fetchApiDetails(this._http).then(apiDetails => {
      this._apiDetails = apiDetails as unknown as ApiDetails;
    })
    this._folderPromise = fetchFolderList(this._http).then(({ folderList, apiList, apiFoxIdMap }) => {
      this._folderList = folderList;
      this._apiList = apiList;
      this._apiFoxIdMap = apiFoxIdMap;
    })
  }

  refresh() {
    return this.initData()
  }

  getNameById(id) {
    return this._apiDetails[id].name
  }

  // 根据文件夹id展示文件夹里面内容
  async list(folderId: string): Promise<ApiFoxIdItem[]> {
    await this._folderPromise
    return Object.keys(this._apiFoxIdMap).filter(key => {
      return this._apiFoxIdMap[key].parentId === Number(folderId)
    }).map(key => this._apiFoxIdMap[key])
  }

  // 将整个更新api操作分解为以文件为颗粒的任务去执行
  async getAllTasks(items, baseDir: string, type: string, prefixPath: string = '/'): Promise<TransferTaskOptions[]> {
    await this._detailPromise
    items = Array.isArray(items) ? items : [items]

    const ids = items.map(item => {
      return querystring.parse(item.query).fsPath
    })
    let { choicesFolders, choicesApis } = this.findFolderAndApi(ids)
    let taskInfos = await getTaskList({ ...this._config, baseDir, prefixPath }, this._folderList, choicesApis, choicesFolders, this._apiDetails)
    return taskInfos.map((info) => {
      return {
        runTask: async () => generateFileContentByFolder(info, type),
        name: info.pathArr.join('/')
      }
    })
  }

  // async generateApi(item, baseDir: string, prefixPath: string = '/') {
  //     await this._detailPromise
  //     let { choicesFolders, choicesApis } = this.findFolderAndApi(item)
  //     return generateApi({ ...this._config, baseDir, prefixPath}, this._folderList, choicesApis, choicesFolders, this._apiDetails)
  // }

  // todo 预览接口详情
  async readFile(id: number | string): Promise<string> {
    await this._detailPromise
    return this._apiDetails[id].toString()
  }

  // 预览接口详情
  async getApiDetail(id: number | string): Promise<ApiDetail> {
    await this._detailPromise
    return this._apiDetails[id]
  }

  // todo 生成mock数据
  async generateMock(item) {
    await this._detailPromise
  }
}
