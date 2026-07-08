import { logger } from './logger';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RetryOptions {
  retries: number;
  baseDelayMs?: number;
  label?: string;
}

export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  const { retries, baseDelayMs = 1000, label = 'operation' } = opts;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt;
        logger.warn(`${label} failed, retrying`, {
          attempt: attempt + 1,
          retries,
          delayMs: delay,
          error: err instanceof Error ? err.message : String(err),
        });
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
