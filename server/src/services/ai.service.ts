import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/extraction';
import { chunk } from '../utils/batch';
import { withRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import type { AiBatchResponse, CrmRecord, SkippedRow } from '../types';

const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 25);
const MAX_RETRIES = Number(process.env.MAX_RETRIES ?? 3);
const AI_MODEL = process.env.AI_MODEL ?? 'llama-3.3-70b-versatile';

let client: Groq | null = null;
function getClient(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set.');
    client = new Groq({ apiKey });
  }
  return client;
}

function extractJson(raw: string): AiBatchResponse {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) text = fenced[1].trim();
  if (!text.startsWith('{')) {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.slice(first, last + 1);
  }
  const parsed = JSON.parse(text) as AiBatchResponse;
  if (!Array.isArray(parsed.records)) parsed.records = [];
  if (!Array.isArray(parsed.skipped)) parsed.skipped = [];
  return parsed;
}

async function callBatch(
  headers: string[],
  rows: Record<string, string>[]
): Promise<AiBatchResponse> {
  const completion = await getClient().chat.completions.create({
    model: AI_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(headers, rows) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from Groq.');
  return extractJson(content);
}

export interface ExtractionOutput {
  records: Partial<CrmRecord>[];
  skipped: SkippedRow[];
}

export async function extractBatches(
  headers: string[],
  records: Record<string, string>[]
): Promise<ExtractionOutput> {
  const batches = chunk(records, BATCH_SIZE);
  logger.info('starting AI extraction', {
    model: AI_MODEL,
    totalRecords: records.length,
    batches: batches.length,
    batchSize: BATCH_SIZE,
  });

  const allRecords: Partial<CrmRecord>[] = [];
  const allSkipped: SkippedRow[] = [];

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const offset = b * BATCH_SIZE;
    try {
      const result = await withRetry(() => callBatch(headers, batch), {
        retries: MAX_RETRIES,
        baseDelayMs: 1000,
        label: `batch ${b + 1}/${batches.length}`,
      });
      allRecords.push(...result.records);
      for (const s of result.skipped) {
        allSkipped.push({ row: offset + s.row_index + 1, reason: s.reason });
      }
      logger.info('batch complete', {
        batch: b + 1,
        mapped: result.records.length,
        skipped: result.skipped.length,
      });
    } catch (err) {
      logger.error('batch failed after retries', {
        batch: b + 1,
        error: err instanceof Error ? err.message : String(err),
      });
      for (let i = 0; i < batch.length; i++) {
        allSkipped.push({
          row: offset + i + 1,
          reason: 'AI extraction failed for this batch after retries.',
        });
      }
    }
  }

  return { records: allRecords, skipped: allSkipped };
}
