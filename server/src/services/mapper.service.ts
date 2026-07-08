import {
  CRM_FIELDS,
  CRM_STATUSES,
  DATA_SOURCES,
  type CrmRecord,
  type CrmStatus,
  type DataSource,
  type SkippedRow,
} from '../types';

const STATUS_SET = new Set<string>(CRM_STATUSES);
const SOURCE_SET = new Set<string>(DATA_SOURCES);

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function isParseableDate(value: string): boolean {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

export function normalize(
  rawRecords: Partial<CrmRecord>[],
  existingSkipped: SkippedRow[]
): { records: CrmRecord[]; skipped: SkippedRow[] } {
  const records: CrmRecord[] = [];
  const skipped: SkippedRow[] = [...existingSkipped];

  rawRecords.forEach((raw, index) => {
    const record = {} as CrmRecord;
    for (const field of CRM_FIELDS) {
      record[field] = str((raw as Record<string, unknown>)[field]) as never;
    }

    if (!STATUS_SET.has(record.crm_status)) record.crm_status = '' as CrmStatus;
    if (!SOURCE_SET.has(record.data_source)) record.data_source = '' as DataSource;

    if (!isParseableDate(record.created_at)) record.created_at = '';

    if (!record.email && !record.mobile_without_country_code) {
      skipped.push({
        row: index + 1,
        reason: 'No email or mobile number after normalization.',
      });
      return;
    }

    records.push(record);
  });

  return { records, skipped };
}
