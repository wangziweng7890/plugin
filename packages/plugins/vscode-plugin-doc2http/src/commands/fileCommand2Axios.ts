import { COMMAND_2_AXIOS } from '../constants';
import { download } from '../fileHandlers';
import { uriFromExplorerContextOrEditorContext } from './shared';
import { checkFileCommand } from './abstract/createCommand';

export default checkFileCommand({
  id: COMMAND_2_AXIOS,
  getFileTarget: uriFromExplorerContextOrEditorContext,

  async handleFile(ctx) {
    await download(ctx, 'axios');
  },
});
