import * as path from 'path';

const VENDOR_FOLDER = '.vscode';

export const EXTENSION_NAME = 'doc2http';
export const SETTING_KEY_REMOTE = 'remotefs.remote';

export const REMOTE_SCHEME = 'doc2http';

export const CONGIF_FILENAME = 'doc2http.json';
export const CONFIG_PATH = path.join(VENDOR_FOLDER, CONGIF_FILENAME);

// command not in package.json
export const COMMAND_TOGGLE_OUTPUT = 'doc2http.toggleOutput';

// commands in package.json
export const COMMAND_CONFIG = 'doc2http.config';
export const COMMAND_CANCEL_ALL_TRANSFER = 'doc2http.cancelAllTransfer';

// 生成swrv
export const COMMAND_DOWNLOAD = 'doc2http.download';
export const COMMAND_DOWNLOAD_WITH_PREFIX = 'doc2http.download.with.prefix';

// 生成axios
export const COMMAND_2_AXIOS = 'doc2http.toAxios';
export const COMMAND_2_AXIOS_WITH_PREFIX = 'doc2http.toAxios.with.prefix';

export const COMMAND_COPY_AS_IMPORT = 'doc2http.copyAsImportFn';

export const COMMAND_REMOTEEXPLORER_REFRESH = 'doc2http.remoteExplorer.refresh';
export const COMMAND_REMOTEEXPLORER_VIEW_CONTENT = 'doc2http.viewContent';


