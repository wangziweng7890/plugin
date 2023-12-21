// @ts-ignore

import axios from 'axios';
export const createHttp = (config) => {
  return axios.create({
    baseURL: config.host + (config.port ? `:${config.port}` : ''),
    timeout: 60 * 1000, // 超时限制 30秒,
    headers: {
      authorization: config.authorization,
      'x-client-version': '2.3.10-alpha.4',
      'X-Project-Id': Number(config.projectId)
    },
  });
};
