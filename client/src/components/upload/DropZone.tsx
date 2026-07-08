'use client';

import { useCallback, useRef, useState } from 'react';
import { MAX_FILE_SIZE } from '@/lib/constants';

interface Props {
  onFile: (file: File) => void;
}

export function DropZone({ onFile }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Only .csv files are supported.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 10MB.');
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/40'
        }`}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-brand-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          />
        </svg>
        <p className="text-base font-semibold text-gray-800">
          Drag &amp; drop your CSV here
        </p>
        <p className="text-sm text-gray-500">or click to browse — max 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
