export function ProgressBar({ indeterminate = true }: { indeterminate?: boolean }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className={`h-full rounded-full bg-brand-600 ${
          indeterminate ? 'w-1/3 animate-[progress_1.2s_ease-in-out_infinite]' : 'w-full'
        }`}
      />
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
