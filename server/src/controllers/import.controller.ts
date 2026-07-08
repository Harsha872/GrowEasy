import type { Request, Response, NextFunction } from 'express';
import { parseCsv, CsvParseError } from '../services/csv.service';
import { extractBatches } from '../services/ai.service';
import { normalize } from '../services/mapper.service';
import { logger } from '../utils/logger';
import type { ImportResult } from '../types';

export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file!;
    logger.info('import received', {
      filename: file.originalname,
      bytes: file.size,
    });

    const { headers, records } = await parseCsv(file.buffer);
    const totalUploaded = records.length;

    const extracted = await extractBatches(headers, records);

    const { records: crmRecords, skipped } = normalize(
      extracted.records,
      extracted.skipped
    );

    const result: ImportResult = {
      records: crmRecords,
      skipped,
      stats: {
        total_uploaded: totalUploaded,
        total_imported: crmRecords.length,
        total_skipped: skipped.length,
      },
    };

    logger.info('import complete', { ...result.stats });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof CsvParseError) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    next(err);
  }
}
