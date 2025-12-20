import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  percentage,
}) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Course Progress</h3>
        <span className="text-sm font-semibold text-blue-600">
          {completed}/{total} lessons • {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface LessonCompleteButtonProps {
  isCompleted: boolean;
  onToggle: () => void;
}

export const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({
  isCompleted,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isCompleted
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span className={`text-lg ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
        {isCompleted ? '✓' : '○'}
      </span>
      {isCompleted ? 'Completed' : 'Mark as Complete'}
    </button>
  );
};
