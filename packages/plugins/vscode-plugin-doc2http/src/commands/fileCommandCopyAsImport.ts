import { COMMAND_COPY_AS_IMPORT } from '../constants';
import { copy } from '../fileHandlers/copy';
import { getActiveDocumentUri } from './shared';
import { checkFileCommand } from './abstract/createCommand';

export default checkFileCommand({
  id: COMMAND_COPY_AS_IMPORT,
  getFileTarget: getActiveDocumentUri,

  async handleFile(ctx) {
    await copy(ctx);
  },
});
