import fse from 'fs-extra'

export function listDir(path) {
  return new Promise((resolve, reject) => {
    fse.readdir(path, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      // 把mac系统下的临时文件去掉
      if (data && data.length > 0 && data[0] === '.DS_Store') {
        data.splice(0, 1)
      }
      resolve(data)
    })
  })
}

export const retryPromiseFunctionGenerator = <T, T2>(
  promiseFunction: (...arg: [T2]) => Promise<T>, // 需要被retry的function
  numRetries = 3, // 最多retry几次
  retryDelayMs = 5000, // 两次retry间的delay
) => async (...arg: [T2]): Promise<T> => {
    for (
      let numRetriesLeft = numRetries;
      numRetriesLeft >= 0;
      numRetriesLeft -= 1
    ) {
      try {
        return await promiseFunction(...arg)
      }
      catch (error) {
        if (numRetriesLeft === 0) {
          throw error
        }
        console.log('\x1B[33m%s\x1B[0m', '[vite-plugin-unocss-iconfont]: 下载超时重试')
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
      }
    }
  }
