import pino from 'pino';

const logger = pino();

export interface IRetryService {
  execute<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
  getRetryCount(): number;
  resetRetryCount(): void;
}

export class RetryService implements IRetryService {
  private retryCount = 0;

  getRetryCount(): number {
    return this.retryCount;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }

  async execute<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxRetries) {
          logger.error(
            { err: error.message, attempt, maxRetries },
            'Retry attempts exhausted'
          );
          throw error;
        }

        this.retryCount++;
        const jitter = Math.random() * 200;
        const backoffDelay = delay * 2 + jitter;

        logger.warn(
          { err: error.message, attempt, backoffDelay },
          'Retry Attempt'
        );

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        delay = delay * 2;
      }
    }
    return operation();
  }
}
