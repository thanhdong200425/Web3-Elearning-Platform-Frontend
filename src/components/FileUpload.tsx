import React, { useRef } from 'react';
import { UseFormSetValue, FieldError } from 'react-hook-form';

export interface FileUploadProps {
  className?: string;
  accept?: string;
  setValue: UseFormSetValue<any>;
  name: string;
  error?: FieldError;
}

const FileUpload: React.FC<FileUploadProps> = ({
  className = '',
  accept = 'image/*',
  setValue,
  name,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(name, file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className='flex items-center gap-1'>
        <label className="text-sm font-medium text-neutral-950">
          Cover Image
        </label>
        <span className="text-sm font-medium text-red-500">*</span>
      </div>
      {/* Required icon */}
      <div
        className={`bg-gray-50 border-2 border-dashed rounded-[10px] h-[268px] w-full flex flex-col items-center justify-center relative ${error ? 'border-red-500' : 'border-gray-300'
          }`}
      >
        {/* Upload Icon */}
        <div className="w-12 h-12 mb-4 flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28 8H12C10.9 8 10 8.9 10 10V38C10 39.1 10.9 40 12 40H36C37.1 40 38 39.1 38 38V18L28 8Z"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 8V18H38"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 32L24 28L28 32L32 28"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="text-base font-medium text-neutral-950 mb-2">
          Upload Cover Image
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          Drag and drop an image here, or browse files
        </p>

        <button
          type="button"
          onClick={handleBrowseClick}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50 transition-colors"
        >
          Browse Files
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
