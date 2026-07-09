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

  async execute<T>(operation: () => Promise<T>, maxRetries = 15): Promise<T> {
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
        const isRateLimit = error.message.toLowerCase().includes('rate limit') || error.message.includes('429');
        const baseDelay = isRateLimit ? 65000 : delay; // Wait 65s for strict 429 quota errors
        const jitter = Math.random() * 500;
        const backoffDelay = isRateLimit ? baseDelay : baseDelay * 2 + jitter;

        logger.warn(
          { err: error.message, attempt, backoffDelay },
          `Retry Attempt (${isRateLimit ? 'Rate Limit Aware' : 'Standard'})`
        );

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        delay = delay * 2;
      }
    }
    return operation();
  }
}
