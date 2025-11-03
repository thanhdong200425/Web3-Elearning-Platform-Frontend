import React, { useRef, useState, useCallback } from 'react';
import type { UseFormSetValue, FieldError } from 'react-hook-form';
import { uploadFileToIPFS } from '@/utils/pinata';

export interface FileUploadProps {
  className?: string;
  accept?: string;
  setValue: UseFormSetValue<any>;
  name: string;              // ví dụ: "coverImage"
  error?: FieldError;
  isRequired?: boolean;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  className = '',
  accept = 'image/*',
  setValue,
  name,
  error,
  isRequired = true,
  label = 'Cover Image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('No file chosen');
  const [uploading, setUploading] = useState<boolean>(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Chuẩn hóa mọi kiểu kết quả từ uploadFileToIPFS
  const normalizeUploadResult = (res: any) => {
    let cid: string | undefined;
    let url: string | undefined;

    if (!res) return { cid: undefined, url: undefined };

    if (typeof res === 'string') {
      cid = res;
    } else if (res.cid) {
      cid = res.cid;
      url = res.url || res.gatewayUrl;
    } else if (res.IpfsHash) {
      cid = res.IpfsHash;
    }

    if (!url && cid) url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    return { cid, url };
  };

  const doUpload = useCallback(async (file: File) => {
    // set vào form (giữ nguyên hành vi cũ)
    setValue(name, file);
    setFileName(file.name);
    setLocalPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const raw = await uploadFileToIPFS(file);
      const { cid, url } = normalizeUploadResult(raw);

      if (cid) {
        setValue(`${name}IpfsCid`, cid, { shouldValidate: false });
      }
      if (url) {
        setValue(`${name}Url`, url, { shouldValidate: false });
        setIpfsUrl(url);
      }
    } catch (e) {
      console.error('IPFS upload failed:', e);
      // Không throw: để user vẫn có thể tiếp tục các bước khác
    } finally {
      setUploading(false);
    }
  }, [name, setValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await doUpload(file);
  };

  const handleBrowseClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  // Drag & drop
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await doUpload(file);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium text-neutral-950">
          {label}
        </label>
        {isRequired && <span className="text-sm font-medium text-red-500">*</span>}
      </div>

      <div
        className={[
          'bg-gray-50 border-2 border-dashed rounded-[10px] h-[268px] w-full',
          'flex flex-col items-center justify-center relative p-4 text-center',
          error ? 'border-red-500' : (dragOver ? 'border-blue-400' : 'border-gray-300')
        ].join(' ')}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Preview nếu có */}
        {localPreview ? (
          <img
            src={localPreview}
            alt="preview"
            className="max-h-40 object-contain mb-3 rounded"
          />
        ) : (
          <div className="w-12 h-12 mb-4 flex items-center justify-center">
            <svg
              width="48" height="48" viewBox="0 0 48 48" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={uploading ? 'opacity-50' : ''}
            >
              <path d="M28 8H12C10.9 8 10 8.9 10 10V38C10 39.1 10.9 40 12 40H36C37.1 40 38 39.1 38 38V18L28 8Z"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 8V18H38"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 32L24 28L28 32L32 28"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <h3 className="text-base font-medium text-neutral-950 mb-1">
          {uploading ? 'Uploading to IPFS…' : 'Upload Cover Image'}
        </h3>

        <p className="text-sm text-gray-600 mb-2">
          {dragOver ? 'Drop file to upload' : 'Drag & drop an image here, or browse files'}
        </p>

        <p className="text-xs text-gray-500 mb-4">{fileName}</p>

        <button
          type="button"
          onClick={handleBrowseClick}
          disabled={uploading}
          className={`bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50 transition-colors ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {uploading ? 'Uploading…' : 'Browse Files'}
        </button>

        {/* Hiển thị link IPFS (nếu có) */}
        {ipfsUrl && (
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 text-xs text-blue-600 underline truncate max-w-[90%]"
            title={ipfsUrl}
          >
            {ipfsUrl}
          </a>
        )}
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
