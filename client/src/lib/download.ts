import type { CrmRecord } from '@/types';
import { CRM_FIELDS } from './constants';

export function downloadCsv(records: CrmRecord[], filename = 'crm_leads.csv'): void {
  const escape = (v: string) => {
    const s = v ?? '';
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = CRM_FIELDS.map((f) => f.key).join(',');
  const lines = records.map((rec) =>
    CRM_FIELDS.map((f) => escape(rec[f.key])).join(',')
  );
  const csv = [header, ...lines].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
