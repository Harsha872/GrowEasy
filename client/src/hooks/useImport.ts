'use client';

import { useState } from 'react';
import { importCsv } from '@/lib/api';
import type { ImportResult } from '@/types';

interface UseImport {
  importFile: (file: File) => Promise<void>;
  results: ImportResult | null;
  error: string | null;
  isProcessing: boolean;
  reset: () => void;
}

export function useImport(): UseImport {
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function importFile(file: File): Promise<void> {
    setIsProcessing(true);
    setError(null);
    setResults(null);
    try {
      const res = await importCsv(file);
      setResults(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setIsProcessing(false);
    }
  }

  function reset(): void {
    setResults(null);
    setError(null);
    setIsProcessing(false);
  }

  return { importFile, results, error, isProcessing, reset };
}
