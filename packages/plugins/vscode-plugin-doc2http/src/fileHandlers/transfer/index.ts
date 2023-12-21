import createFileHandler, { FileHandlerContext } from '../createFileHandler';
import { TransferTask } from '../../core'
import { window } from 'vscode';

async function downloadHandle(this: FileHandlerContext, type, prefix?) {
  const scheduler = this.fileService.createTransferScheduler();
  const tasks = await this.fileService.createTransferTasks(this.uris, type, prefix);
  await Promise.all(tasks.map(async task => {
    scheduler.add(new TransferTask(task))
  }));
  await scheduler.run();
};

export const download = createFileHandler({
  name: 'download',
  async handle(type) {
    return downloadHandle.call(this, type);
  }
});


export const downloadWithPrefix = createFileHandler({
  name: 'downloadWithPrefix',
  async handle(type) {
    let prefix = await window.showInputBox({
      value: '',
      prompt: 'Please input prefix path',
    });
    return downloadHandle.call(this, type, prefix);
  }
})
