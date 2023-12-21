import { Uri } from 'vscode';
import app from '../app';
import { FileService, FileServiceConfig } from '../core';
import { getFileService } from '../modules/serviceManager';

export interface FileHandlerContext {
  uris: Uri[];
  fileService: FileService;
  config: FileServiceConfig;
}

type FileHandlerContextMethod<R = void> = (this: FileHandlerContext) => R;
type FileHandlerContextMethodArg1<R = void> = (this: FileHandlerContext, type?: string) => R;

interface FileHandlerOption {
  name: string;
  handle: FileHandlerContextMethodArg1;
  afterHandle?: FileHandlerContextMethod;
}

export function handleCtxFromUri(uris: Uri[]): FileHandlerContext {
  const fileService = getFileService(uris[0]);
  if (!fileService) {
    throw new Error(`Config Not Found. (${uris[0].toString(true)})`);
  }
  const config = fileService.getConfig();
  return {
    fileService,
    config,
    uris,
  };
}

export default function createFileHandler(
  handlerOption: FileHandlerOption,
): (ctx: FileHandlerContext, type: string) => Promise<void> {
  async function fileHandle(ctx: FileHandlerContext, type: string) {
    const handleCtx = ctx;
    app.sftpBarItem.startSpinner();
    try {
      await handlerOption.handle.call(handleCtx, type);
    } finally {
      app.sftpBarItem.stopSpinner();
    }
    if (handlerOption.afterHandle) {
      handlerOption.afterHandle.call(handleCtx);
    }
  }

  return fileHandle;
}
