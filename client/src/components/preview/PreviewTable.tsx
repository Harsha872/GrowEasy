'use client';

import { PREVIEW_ROW_LIMIT } from '@/lib/constants';

interface Props {
  headers: string[];
  rows: Record<string, string>[];
}

export function PreviewTable({ headers, rows }: Props) {
  const shown = rows.slice(0, PREVIEW_ROW_LIMIT);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {shown.length} of {rows.length} rows
        </p>
      </div>
      <div className="max-h-[420px] overflow-auto rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i} className="even:bg-gray-50/60">
                {headers.map((h) => (
                  <td
                    key={h}
                    className="max-w-[240px] truncate border-b border-gray-100 px-4 py-2 text-gray-700"
                    title={row[h]}
                  >
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
