import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs-extra'

export default class Webview {
  private _panel: vscode.WebviewPanel
  private _context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this._context = context
  }

  async show(data: any, title: string) {
    if (this._panel) {
      return this._updateWebview(data, title)
    }
    this._panel = vscode.window.createWebviewPanel('doc2httpApiDetailPanel', title, {
      viewColumn: vscode.ViewColumn.Active,
      preserveFocus: true,
    }, {
      enableCommandUris: true,
      // retainContextWhenHidden: true,
      enableScripts: true,
    })
    const htmlContent = await this._getHtmlContent()
    const previewBase = this._panel.webview.asWebviewUri(
      this.getUri({ context: this._context, relativePath: 'dist2/assets/' })
    )
    this._panel.webview.html = htmlContent.replace(/\/assets\//g, previewBase.toString())
    this._updateWebview(data, title)
    this._panel.onDidDispose(
      () => {
        this._panel = undefined
      },
      undefined,
      this._context.subscriptions
    )
  }

  private _getHtmlContent(): Promise<string> {
    return fs.readFile(path.join(this._context.extensionPath, 'dist2/index.html'), 'utf8')
  }

  private _updateWebview(data: any, title: string) {
    this._panel.title = title
    this._panel.webview.postMessage(data)
  }

  getUri({
    context,
    relativePath,
  }: {
    context: vscode.ExtensionContext
    relativePath: string
  }): vscode.Uri {
    return vscode.Uri.file(path.join(context.extensionPath, relativePath))
  }
}
