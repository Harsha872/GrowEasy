const colorMap: Record<string, string> = {
  green: 'bg-brand-100 text-brand-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
};

export function Badge({ color = 'gray', children }: { color?: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colorMap[color] ?? colorMap.gray
      }`}
    >
      {children}
    </span>
  );
}
