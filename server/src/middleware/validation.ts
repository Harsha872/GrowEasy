import type { Request, Response, NextFunction } from 'express';

export function validateImportRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    res
      .status(400)
      .json({ success: false, error: 'No file uploaded. Attach a CSV as "file".' });
    return;
  }
  if (!req.file.buffer || req.file.size === 0) {
    res.status(400).json({ success: false, error: 'Uploaded file is empty.' });
    return;
  }
  next();
}
