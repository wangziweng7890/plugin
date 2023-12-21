
import { Task } from './scheduler';
export type  TransferTaskOptions = {
  runTask: () => Promise<unknown>
  cancelTask?: () => unknown | Promise<unknown>
  name: string
}
export default class TransferTask implements Task {
  private _cancelled: boolean;
  private _runTask: TransferTaskOptions["runTask"];
  private _cancelTask?: TransferTaskOptions["cancelTask"];
  name: string;
  constructor(
    option: TransferTaskOptions
  ) {
    this._runTask = option.runTask
    this._cancelTask = option.cancelTask || (()=> {})
    this.name = option.name
  }

  async run() {
    await this._runTask()
  }

  cancel() {
    if (!this._cancelled) {
      this._cancelTask()
      this._cancelled = true;
    }
  }

  isCancelled(): boolean {
    return this._cancelled;
  }
}
