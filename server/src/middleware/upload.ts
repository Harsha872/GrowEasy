import Busboy from 'busboy';
import type { Request, Response, NextFunction } from 'express';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isCsvFile(filename: string, mimeType: string): boolean {
  return (
    mimeType === 'text/csv' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/octet-stream' ||
    filename.toLowerCase().endsWith('.csv')
  );
}

export function upload(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('multipart/form-data')) {
    next();
    return;
  }

  let busboy: ReturnType<typeof Busboy>;
  try {
    busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    });
  } catch (err) {
    next(err instanceof Error ? err : new Error(String(err)));
    return;
  }

  const chunks: Buffer[] = [];
  let filename = '';
  let mimeType = '';
  let gotFile = false;
  let tooLarge = false;
  let invalidFormat = false;
  let settled = false;

  const finish = (err?: Error): void => {
    if (settled) return;
    settled = true;
    if (err) return next(err);
    if (invalidFormat) {
      return next(new Error('Invalid file format. Please upload a CSV file.'));
    }
    if (tooLarge) {
      return next(new Error('File is too large. Maximum size is 10MB.'));
    }
    if (gotFile) {
      const buffer = Buffer.concat(chunks);
      req.file = {
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype: mimeType,
        size: buffer.length,
        buffer,
      } as Express.Multer.File;
    }
    next();
  };

  busboy.on('file', (_name, stream, info) => {
    if (gotFile) {
      stream.resume();
      return;
    }
    if (!isCsvFile(info.filename ?? '', info.mimeType ?? '')) {
      invalidFormat = true;
      stream.resume();
      return;
    }
    gotFile = true;
    filename = info.filename ?? 'upload.csv';
    mimeType = info.mimeType ?? 'text/csv';
    stream.on('data', (d: Buffer) => chunks.push(d));
    stream.on('limit', () => {
      tooLarge = true;
    });
  });

  busboy.on('error', (err) =>
    finish(err instanceof Error ? err : new Error(String(err)))
  );
  busboy.on('finish', () => finish());

  const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
  if (raw && raw.length > 0) {
    busboy.end(raw);
  } else {
    req.pipe(busboy);
  }
}
