import * as vscode from 'vscode'
import { FileType } from 'vscode'
import Webview from '../../webview/index'
import {
  upath,
  UResource,
  Resource,
  FileService,
  FileServiceConfig,
} from '../../core'
import {
  COMMAND_REMOTEEXPLORER_VIEW_CONTENT,
} from '../../constants'
import { getAllFileService } from '../serviceManager'

type Id = number;

const previewDocumentPathPrefix = '/~ ';

/**
 * covert the url path for a customed docuemnt title
 *
 *  There is no api to custom title.
 *  So we change url path for custom title.
 *  This is not break anything because we get fspth from uri.query.'
 */
function makePreivewUrl(uri: vscode.Uri, name) {
  // const query = querystring.parse(uri.query);
  // query.originPath = uri.path;
  // query.originQuery = uri.query;

  return uri.with({
    path: previewDocumentPathPrefix + name,
    // query: querystring.stringify(query),
  });
}

interface ExplorerChild extends vscode.TreeItem {
  resource: Resource;
  isDirectory: boolean;
  name: string
  sort: number
}

export interface ExplorerRoot extends ExplorerChild {
  explorerContext: {
    fileService: FileService;
    config: FileServiceConfig;
    id: Id;
  };
}

export type ExplorerItem = ExplorerRoot | ExplorerChild;

function dirFirstSort(fileA: ExplorerItem, fileB: ExplorerItem) {
  return fileA.sort - fileB.sort;
}

export default class RemoteTreeData
  implements vscode.TreeDataProvider<ExplorerItem>, vscode.TextDocumentContentProvider {
  private _roots: ExplorerRoot[] | null;
  private _rootsMap: Map<Id, ExplorerRoot> | null;
  private _map: Map<vscode.Uri['query'], ExplorerItem>;
  private _webview: Webview;
  private _onDidChangeFolder: vscode.EventEmitter<ExplorerItem> = new vscode.EventEmitter<
    ExplorerItem
  >();
  private _onDidChangeFile: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChangeTreeData: vscode.Event<ExplorerItem> = this._onDidChangeFolder.event;
  readonly onDidChange: vscode.Event<vscode.Uri> = this._onDidChangeFile.event;

  constructor(context: vscode.ExtensionContext) {
    this._webview = new Webview(context)
  }

  async refresh(): Promise<any> {
    // refresh root
    this._roots = null;
    this._rootsMap = null;
    this._onDidChangeFolder.fire();
  }

  async getTreeItem(item: ExplorerItem): Promise<vscode.TreeItem> {
    const isRoot = (item as ExplorerRoot).explorerContext !== undefined;
    let customLabel;
    if (isRoot) {
      customLabel = (item as ExplorerRoot).explorerContext.fileService.name;
    }
    if (!customLabel) {
      customLabel = item.name;
    }
    return {
      label: `${customLabel}`,
      resourceUri: item.resource.uri,
      collapsibleState: isRoot ? vscode.TreeItemCollapsibleState.Expanded : item.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : undefined,
      contextValue: isRoot ? 'root' : item.isDirectory ? 'folder' : 'file',
      tooltip: '鼠标左键双击查看该接口详情，右键查看所有操作',
      command: item.isDirectory
        ? undefined
        : {
          command: COMMAND_REMOTEEXPLORER_VIEW_CONTENT,
          arguments: [item],
          title: 'View Remote Resource',
        },
    };
  }

  async getChildren(item?: ExplorerItem): Promise<ExplorerItem[]> {
    if (!item) {
      return this._getRoots();
    }

    const root = this.findRoot(item.resource.uri);
    if (!root) {
      throw new Error(`Can't find config for remote resource ${item.resource.uri}.`);
    }
    const remotefs = await root.explorerContext.fileService.getFileSystem();
    const fileEntries = await remotefs.list(root.resource.fsPath === item.resource.fsPath ? '0' : item.resource.fsPath);

    return fileEntries
      .map(file => {
        const isDirectory = file.type === FileType.Directory;
        const newResource = UResource.updateResource(item.resource, {
          remotePath: file.fspath,
        });
        const mapItem = this._map.get(newResource.uri.query);
        if (mapItem) {
          return mapItem;
        } else {
          const newItem = {
            resource: UResource.updateResource(item.resource, {
              remotePath: file.fspath,
            }),
            isDirectory,
            name: file.name,
            sort: file.sort
          };
          this._map.set(newItem.resource.uri.query, newItem);
          return newItem;
        }
      })
      .sort(dirFirstSort);
  }

  async getParent(item: ExplorerChild): Promise<ExplorerItem> {
    const resourceUri = item.resource.uri;
    const root = this.findRoot(resourceUri);
    if (!root) {
      throw new Error(`Can't find config for remote resource ${resourceUri}.`);
    }

    if (item.resource.fsPath === root.resource.fsPath) {
      return root;
    }

    const fspath = upath.dirname(item.resource.fsPath);
    const newResource = UResource.updateResource(item.resource, {
      remotePath: fspath,
    });
    const mapItem = this._map.get(newResource.uri.query);
    if (mapItem) {
      return mapItem;
    } else {
      const newMapItem = {
        resource: newResource,
        isDirectory: true,
        name: item.name,
        sort: item.sort
      };
      this._map.set(newResource.uri.query, newMapItem);
      await this.getChildren(newMapItem);
      return newMapItem;
    }
  }

  findRoot(uri: vscode.Uri): ExplorerRoot | null | undefined {
    if (!this._rootsMap) {
      return null;
    }

    const rootId = UResource.makeResource(uri).remoteId;
    return this._rootsMap.get(rootId);
  }

  async provideTextDocumentContent(
    uri: vscode.Uri,
  ): Promise<string> {
    const root = this.findRoot(uri);
    if (!root) {
      throw new Error(`Can't find remote for resource ${uri}.`);
    }
    const remotefs = await root.explorerContext.fileService.getFileSystem();
    return remotefs.readFile(UResource.makeResource(uri).fsPath);
  }

  async showItem(item: ExplorerItem): Promise<void> {
    if (item.isDirectory) {
      return
    }
    const root = this.findRoot(item.resource.uri)
    const data = await root.explorerContext.fileService.getFileSystem().getApiDetail(item.resource.fsPath)
    this._webview.show(data, item.name)
  }

  private _getRoots(): ExplorerRoot[] {
    if (this._roots) {
      return this._roots;
    }

    this._roots = [];
    this._rootsMap = new Map();
    this._map = new Map();
    getAllFileService().forEach(fileService => {
      const config = fileService.getConfig();
      const id = fileService.id;
      fileService.refresh()
      const item = {
        resource: UResource.makeResource({
          remote: {
            host: config.host,
            port: config.port,
          },
          fsPath: 'root' + id,
          remoteId: id,
        }),
        name: config.name,
        sort: id,
        isDirectory: true,
        explorerContext: {
          fileService,
          config,
          id,
        },
      };
      this._roots!.push(item);
      this._rootsMap!.set(id, item);
      this._map.set(item.resource.uri.query, item);
    });
    this._roots.sort((a, b) => a.explorerContext.fileService.name.localeCompare(b.explorerContext.fileService.name));
    return this._roots;
  }
}
