import { reportError } from '../../helper';
import logger from '../../logger';

export interface ITarget {
  fsPath: string;
}

export interface CommandOption {
  [x: string]: any;
}

export default abstract class Command {
  id: string;
  name!: string;

  protected abstract doCommandRun(...args: any[]);

  async run(...args) {
    logger.trace(`run command '${this.name}'`);
    try {
      await this.doCommandRun(...args);
    } catch (error) {
      reportError(error);
    } finally {
      logger.trace(`run command '${this.name}' done`);
    }
  }
}
