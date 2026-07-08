'use client';

import { useEffect, useState } from 'react';
import { DropZone } from '@/components/upload/DropZone';
import { PreviewTable } from '@/components/preview/PreviewTable';
import { ResultsTable } from '@/components/results/ResultsTable';
import { ImportStats } from '@/components/results/ImportStats';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { useCSVParser } from '@/hooks/useCSVParser';
import { useImport } from '@/hooks/useImport';
import { downloadCsv } from '@/lib/download';

type Step = 'upload' | 'preview' | 'processing' | 'results';

export default function ImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);

  const { headers, rows, error: parseError, isLoading } = useCSVParser(file);
  const { importFile, results, error: importError, isProcessing, reset } = useImport();

  useEffect(() => {
    if (file && !isLoading && !parseError && headers.length > 0) {
      setStep('preview');
    }
  }, [file, isLoading, parseError, headers.length]);

  useEffect(() => {
    if (step !== 'processing') return;
    if (results) setStep('results');
    else if (importError) setStep('preview');
  }, [step, results, importError]);

  function startOver() {
    setFile(null);
    reset();
    setStep('upload');
  }

  async function confirmImport() {
    if (!file) return;
    setStep('processing');
    await importFile(file);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          GrowEasy CSV Importer
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload any lead CSV — AI maps it to standardized CRM records.
        </p>
      </header>

      <Stepper step={step} />

      <div className="mt-8">
        {step === 'upload' && (
          <Card className="p-8">
            <DropZone onFile={setFile} />
            {isLoading && (
              <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Spinner className="text-brand-600" /> Parsing CSV…
              </p>
            )}
            {parseError && (
              <p className="mt-4 text-sm font-medium text-red-600">{parseError}</p>
            )}
          </Card>
        )}

        {step === 'preview' && (
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                <p className="text-sm text-gray-500">
                  Review the raw data, then confirm to run AI extraction.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={startOver}>
                  Re-upload
                </Button>
                <Button onClick={confirmImport}>Confirm Import</Button>
              </div>
            </div>
            {importError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {importError}
              </p>
            )}
            <PreviewTable headers={headers} rows={rows} />
          </Card>
        )}

        {step === 'processing' && (
          <Card className="p-10">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-4 flex justify-center text-brand-600">
                <Spinner className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Extracting with AI…
              </h2>
              <p className="mb-6 mt-1 text-sm text-gray-500">
                Mapping {rows.length} rows in batches. This can take a moment.
              </p>
              <ProgressBar />
            </div>
          </Card>
        )}

        {step === 'results' && results && (
          <div className="space-y-6">
            <ImportStats stats={results.stats} />

            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Imported CRM Records
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => downloadCsv(results.records)}
                    disabled={results.records.length === 0}
                  >
                    Download CSV
                  </Button>
                  <Button onClick={startOver}>Start Over</Button>
                </div>
              </div>
              <ResultsTable records={results.records} />
            </Card>

            {results.skipped.length > 0 && (
              <Card className="p-6">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                  Skipped Rows ({results.skipped.length})
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {results.skipped.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-medium text-amber-600">Row {s.row}:</span>
                      <span>{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'preview', label: 'Preview' },
    { key: 'processing', label: 'Process' },
    { key: 'results', label: 'Results' },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                active
                  ? 'bg-brand-600 text-white'
                  : done
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={
                active ? 'font-semibold text-gray-900' : 'text-gray-500'
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-1 text-gray-300">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
