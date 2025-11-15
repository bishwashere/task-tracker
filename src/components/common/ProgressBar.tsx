interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  progress, 
  showPercentage = true, 
  className = "" 
}: ProgressBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-200 h-4 rounded">
        <div
          className="bg-green-500 h-4 rounded transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-700 bg-white px-1 rounded shadow-sm">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
