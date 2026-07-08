import { Readable } from 'stream';
import csvParser from 'csv-parser';
import type { ParsedCsv } from '../types';

export class CsvParseError extends Error {}

export function parseCsv(buffer: Buffer): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    const records: Record<string, string>[] = [];
    let headers: string[] = [];

    const stream = Readable.from(buffer)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim() }))
      .on('headers', (h: string[]) => {
        headers = h;
      })
      .on('data', (row: Record<string, string>) => {
        const cleaned: Record<string, string> = {};
        let hasValue = false;
        for (const [key, value] of Object.entries(row)) {
          const v = (value ?? '').toString().trim();
          cleaned[key] = v;
          if (v) hasValue = true;
        }
        if (hasValue) records.push(cleaned);
      })
      .on('end', () => {
        if (headers.length === 0) {
          reject(new CsvParseError('CSV has no header row.'));
          return;
        }
        if (records.length === 0) {
          reject(new CsvParseError('CSV contains no data rows.'));
          return;
        }
        resolve({ headers, records });
      })
      .on('error', (err: Error) => {
        reject(new CsvParseError(`Failed to parse CSV: ${err.message}`));
      });

    stream.on('error', (err: Error) => {
      reject(new CsvParseError(`Failed to read CSV: ${err.message}`));
    });
  });
}
