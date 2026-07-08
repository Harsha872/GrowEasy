'use client';

import { CRM_FIELDS, STATUS_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/Badge';
import type { CrmRecord } from '@/types';

export function ResultsTable({ records }: { records: CrmRecord[] }) {
  if (records.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        No records were imported.
      </p>
    );
  }

  return (
    <div className="max-h-[520px] overflow-auto rounded-xl border border-gray-200">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-gray-100">
          <tr>
            {CRM_FIELDS.map((f) => (
              <th
                key={f.key}
                className="whitespace-nowrap border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700"
              >
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((rec, i) => (
            <tr key={i} className="even:bg-gray-50/60">
              {CRM_FIELDS.map((f) => (
                <td
                  key={f.key}
                  className="max-w-[220px] truncate border-b border-gray-100 px-4 py-2 text-gray-700"
                  title={rec[f.key]}
                >
                  {f.key === 'crm_status' && rec.crm_status ? (
                    <Badge color={STATUS_COLORS[rec.crm_status] ?? 'gray'}>
                      {rec.crm_status}
                    </Badge>
                  ) : (
                    rec[f.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
