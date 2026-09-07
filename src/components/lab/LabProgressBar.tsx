interface Props {
  percent: number;
  completed: number;
  total: number;
  label?: string;
}

export function LabProgressBar({ percent, completed, total, label }: Props) {
  return (
    <div>
      {label && <p className="text-sm font-medium text-primary-900 mb-1.5">{label}</p>}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">
        {percent}% — {completed} de {total} clases completadas
      </p>
    </div>
  );
}
