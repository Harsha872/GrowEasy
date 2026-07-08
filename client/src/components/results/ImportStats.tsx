'use client';

import { Card } from '@/components/ui/Card';
import type { ImportStats as Stats } from '@/types';

export function ImportStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total Uploaded', value: stats.total_uploaded, tone: 'text-gray-800' },
    { label: 'Imported', value: stats.total_imported, tone: 'text-brand-600' },
    { label: 'Skipped', value: stats.total_skipped, tone: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <p className="text-sm font-medium text-gray-500">{c.label}</p>
          <p className={`mt-1 text-3xl font-bold ${c.tone}`}>{c.value}</p>
        </Card>
      ))}
    </div>
  );
}
