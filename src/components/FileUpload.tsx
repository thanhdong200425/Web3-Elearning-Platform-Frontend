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
    <div className={`relative shrink-0 w-full ${className}`}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start p-4 relative w-full">
        <div
          className={`border-2 border-dashed relative rounded-xl shrink-0 w-full ${error ? 'border-red-500' : 'border-[#dbe0e5]'}`}
        >
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-6 items-center px-[26px] py-[58px] relative w-full">
            <div className="max-w-[480px] relative shrink-0">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-2 items-center max-w-inherit relative">
                <div className="h-[23px] max-w-[480px] relative shrink-0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[23px] items-center max-w-inherit relative">
                    <p className="font-['Manrope:Bold',sans-serif] font-bold leading-[23px] relative shrink-0 text-[#121417] text-lg text-center w-full whitespace-pre-wrap">
                      Upload Cover Image
                    </p>
                  </div>
                </div>
                <div className="max-w-[480px] relative shrink-0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-center max-w-inherit relative">
                    <p className="font-['Manrope:Regular',sans-serif] font-normal leading-[21px] relative shrink-0 text-[#121417] text-sm text-center w-full whitespace-pre-wrap">
                      Drag and drop an image here, or browse files
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#f0f2f5] h-10 max-w-[480px] min-w-[84px] relative rounded-xl shrink-0">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-10 items-center justify-center max-w-inherit min-w-inherit overflow-clip px-4 py-0 relative rounded-[inherit]">
                <div className="relative shrink-0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-center overflow-clip relative rounded-[inherit]">
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="font-['Manrope:Bold',sans-serif] font-bold leading-[21px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#121417] text-sm text-center w-full whitespace-nowrap cursor-pointer bg-transparent border-none outline-none"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>
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
