import {
  TransferTask,
} from '../../core';


export async function transfer(
  config: any,
  collect: (t: TransferTask) => void
) {
  collect(new TransferTask(config))
}
