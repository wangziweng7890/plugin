import * as vscode from 'vscode';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as Joi from 'joi';
import { CONFIG_PATH } from '../constants';
import { reportError } from '../helper';
import { showTextDocument } from '../host';

export type Config = {
  name: string,
  projectId: number,
  authorization: string,
  context: string,
  host: string,
  port: number,
  alias?: {
    [prop: string]: string | RegExp
  }
}

const configScheme = {
  name: Joi.string(),
  projectId: Joi.string().required(),
  authorization: Joi.string().required(),
  context: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number(),
  alias: Joi.object()
};

const defaultConfig = {
  context: 'src/services/apifox'
};

function mergedDefault(config) {
  return {
    ...defaultConfig,
    ...config,
  };
}

function getConfigPath(basePath) {
  return path.join(basePath, CONFIG_PATH);
}

export function validateConfig(config) {
  const { error } = Joi.validate(config, configScheme, {
    allowUnknown: true,
    convert: false,
    language: {
      object: {
        child: '!!prop "{{!child}}" fails because {{reason}}',
      },
    },
  });
  return error;
}

export function readConfigsFromFile(configPath): Promise<any[]> {
  return fse.readJson(configPath).then(config => {
    const configs = Array.isArray(config) ? config : [config];
    return configs.map(mergedDefault);
  });
}

export function tryLoadConfigs(workspace): Promise<any[]> {
  const configPath = getConfigPath(workspace);
  return fse.pathExists(configPath).then(
    exist => {
      if (exist) {
        return readConfigsFromFile(configPath);
      }
      return [];
    },
    _ => []
  );
}

export function newConfig(basePath) {
  const configPath = getConfigPath(basePath);

  return fse
    .pathExists(configPath)
    .then(exist => {
      if (exist) {
        return showTextDocument(vscode.Uri.file(configPath));
      }

      return fse
        .outputJson(
          configPath,
          {
            projectId: '2581365',
            authorization: '',
            context: "src/services/apifox",
            host: 'http://api.apifox.cn',
            name: 'apifox',
            alias: {
              '@/': 'src/'
            }
          },
          { spaces: 2 }
        )
        .then(() => showTextDocument(vscode.Uri.file(configPath)));
    })
    .catch(reportError);
}
