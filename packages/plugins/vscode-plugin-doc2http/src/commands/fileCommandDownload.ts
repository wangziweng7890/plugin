import { COMMAND_DOWNLOAD } from '../constants';
import { download } from '../fileHandlers';
import { uriFromExplorerContextOrEditorContext } from './shared';
import { checkFileCommand } from './abstract/createCommand';

export default checkFileCommand({
  id: COMMAND_DOWNLOAD,
  getFileTarget: uriFromExplorerContextOrEditorContext,

  async handleFile(ctx) {
    await download(ctx, 'swrv');
  },
});
