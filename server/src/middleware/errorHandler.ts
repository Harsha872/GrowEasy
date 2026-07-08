import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum size is 10MB.'
        : `Upload error: ${err.message}`;
    res.status(400).json({ success: false, error: message });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  logger.error('unhandled error', { error: message });
  const status = /invalid file format|too large/i.test(message) ? 400 : 500;
  res.status(status).json({ success: false, error: message });
}
