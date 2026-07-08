export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new Error('batch size must be > 0');
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}
