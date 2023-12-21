import { COMMAND_DOWNLOAD_WITH_PREFIX } from '../constants';
import { downloadWithPrefix } from '../fileHandlers';
import { uriFromExplorerContextOrEditorContext } from './shared';
import { checkFileCommand } from './abstract/createCommand';

export default checkFileCommand({
  id: COMMAND_DOWNLOAD_WITH_PREFIX,
  getFileTarget: uriFromExplorerContextOrEditorContext,

  async handleFile(ctx) {
    await downloadWithPrefix(ctx, 'swrv');
  },
});
