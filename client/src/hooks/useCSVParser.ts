'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import type { ParsedCsv } from '@/types';

interface UseCSVParser {
  headers: string[];
  rows: Record<string, string>[];
  error: string | null;
  isLoading: boolean;
}

export function useCSVParser(file: File | null): UseCSVParser {
  const [state, setState] = useState<UseCSVParser>({
    headers: [],
    rows: [],
    error: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!file) {
      setState({ headers: [], rows: [], error: null, isLoading: false });
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = (results.meta.fields ?? []).map((h) => h.trim());
        const rows = results.data;
        if (headers.length === 0 || rows.length === 0) {
          setState({
            headers: [],
            rows: [],
            error: 'The CSV appears to be empty or has no header row.',
            isLoading: false,
          });
          return;
        }
        setState({ headers, rows, error: null, isLoading: false });
      },
      error: (err) => {
        setState({
          headers: [],
          rows: [],
          error: err.message || 'Failed to parse CSV.',
          isLoading: false,
        });
      },
    });
  }, [file]);

  return state;
}

export type { ParsedCsv };
