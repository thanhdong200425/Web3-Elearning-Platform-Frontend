import React, { useRef, useState, useCallback, useEffect } from "react";
import type { UseFormSetValue, FieldError } from "react-hook-form";
import { uploadFileToIPFS } from "@/services/ipfs";

export interface FileUploadProps {
  className?: string;
  accept?: string;
  setValue: UseFormSetValue<any>;
  name: string; // ví dụ: "coverImage"
  error?: FieldError;
  isRequired?: boolean;
  label?: string;
  value?: File; // Current file from form
  placeholder?: string;
  uploadToIPFS?: boolean; // Enable immediate IPFS upload
  onUploadComplete?: (cid: string, url: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  className = "",
  accept = "image/*",
  setValue,
  name,
  error,
  isRequired = true,
  label = "Cover Image",
  value,
  placeholder = "Upload cover image",
  uploadToIPFS = false,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("No file chosen");
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "other">("image");
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Restore preview when component mounts or value changes
  useEffect(() => {
    if (value instanceof File) {
      setFileName(value.name);
      setLocalPreview(URL.createObjectURL(value));

      // Detect file type
      if (value.type.startsWith("image/")) {
        setFileType("image");
      } else if (value.type.startsWith("video/")) {
        setFileType("video");
      } else {
        setFileType("other");
      }
    } else if (!value) {
      // Clear preview if value is cleared externally
      setFileName("No file chosen");
      setLocalPreview(null);
      setIpfsUrl(null);
      setFileType("image");
    }
  }, [value]);

  const doUpload = useCallback(
    async (file: File) => {
      // Store file in form and show preview
      setValue(name, file);
      setFileName(file.name);
      setLocalPreview(URL.createObjectURL(file));

      // Detect file type
      if (file.type.startsWith("image/")) {
        setFileType("image");
      } else if (file.type.startsWith("video/")) {
        setFileType("video");
      } else {
        setFileType("other");
      }

      // Clear any previous IPFS data
      setValue(`${name}IpfsCid`, undefined, { shouldValidate: false });
      setValue(`${name}Url`, undefined, { shouldValidate: false });
      setIpfsUrl(null);

      // Upload to IPFS if enabled
      if (uploadToIPFS) {
        try {
          setIsUploading(true);
          setUploadProgress("Uploading to IPFS...");

          const cid = await uploadFileToIPFS(file);
          const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

          // Store IPFS data
          setValue(`${name}IpfsCid`, cid, { shouldValidate: false });
          setValue(`${name}Url`, gatewayUrl, { shouldValidate: false });
          setIpfsUrl(gatewayUrl);
          setUploadProgress("Uploaded to IPFS");

          // Notify parent component
          onUploadComplete?.(cid, gatewayUrl);
        } catch (error) {
          console.error("Failed to upload to IPFS:", error);
          setUploadProgress("Upload failed");
        } finally {
          setIsUploading(false);
          setTimeout(() => setUploadProgress(""), 3000);
        }
      }
    },
    [name, setValue, uploadToIPFS, onUploadComplete]
  );

  const handleRemove = () => {
    if (isUploading) return; // Prevent removal during upload

    setLocalPreview(null);
    setFileName("No file chosen");
    setIpfsUrl(null);
    setFileType("image");
    setUploadProgress("");
    setValue(name, undefined);
    setValue(`${name}IpfsCid`, undefined, { shouldValidate: false });
    setValue(`${name}Url`, undefined, { shouldValidate: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) await doUpload(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
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
        <label className="text-sm font-medium text-neutral-950">{label}</label>
        {isRequired && (
          <span className="text-sm font-medium text-red-500">*</span>
        )}
      </div>

      {/* Show full preview with overlay buttons when file is uploaded */}
      {localPreview ? (
        <div className="relative w-full h-[268px] rounded-[14px] overflow-hidden group">
          {fileType === "image" && (
            <img
              src={localPreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          )}
          {fileType === "video" && (
            <video
              src={localPreview}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}
          {fileType === "other" && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-2"
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
                </svg>
                <p className="text-sm text-gray-600">{fileName}</p>
              </div>
            </div>
          )}
          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900">
                  {uploadProgress}
                </span>
              </div>
            </div>
          )}

          {/* Overlay buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="bg-white hover:bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-white hover:bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Remove
            </button>
          </div>
          {/* IPFS status indicator - only show if uploaded */}
          {ipfsUrl && !isUploading && (
            <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-md shadow-lg">
              ✓ Uploaded to IPFS
            </div>
          )}
        </div>
      ) : (
        <div
          className={[
            "bg-gray-50 border-2 border-dashed rounded-[10px] h-[268px] w-full",
            "flex flex-col items-center justify-center relative p-4 text-center",
            error
              ? "border-red-500"
              : dragOver
                ? "border-blue-400"
                : "border-gray-300",
          ].join(" ")}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
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

          <h3 className="text-base font-medium text-neutral-950 mb-1">
            {placeholder}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {dragOver
              ? "Drop file to upload"
              : "Drag & drop a file here, or browse files"}
          </p>

          <button
            type="button"
            onClick={handleBrowseClick}
            disabled={isUploading}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse Files
          </button>
        </div>
      )}

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
