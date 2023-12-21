import { copyText, getActiveTextEditor, pathRelativeToWorkspace } from '../host'
import type { FileHandlerContext } from './createFileHandler'

export async function copy(ctx: FileHandlerContext) {
  const config = ctx.config
  const textEdit = getActiveTextEditor()
  const textDoc = textEdit.document
  const apiNames = textEdit.selections.map(range => {
    return textDoc.getText(range)
  })
  const pathName = pathRelativeToWorkspace(textDoc.fileName).replace(/(.js|.ts)/, '')
  const filePath = Object.keys(config.alias).reduce((pre, cur) => {
    return pre.replace(config.alias[cur], cur)
  }, pathName)
  const content = `import { ${apiNames.join(', ')} } from '${filePath}'`
  return copyText(content)
}
