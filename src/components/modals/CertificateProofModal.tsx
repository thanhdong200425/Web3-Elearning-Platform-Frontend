import React, { useEffect } from 'react';
import { Button } from '@heroui/button';
import {
  CheckCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
  DownloadIcon,
  BlockchainIcon,
  CopyIcon,
  CertificateIcon,
} from './icons';
import { addToast } from '@heroui/toast';

interface CertificateProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: {
    courseName: string;
    studentName: string;
    issuer: string;
    issueDate: string;
    transactionHash: string;
  };
}

const CertificateProofModal: React.FC<CertificateProofModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.transactionHash);
    addToast({
      title: 'Copied!',
      description: 'Transaction hash copied to clipboard',
      color: 'success',
      timeout: 2000,
    });
  };

  const handleViewOnExplorer = () => {
    // In a real app, this would open the blockchain explorer
    window.open(
      `https://sepolia.etherscan.io/tx/${certificate.transactionHash}`,
      '_blank'
    );
  };

  const handleDownloadPDF = () => {
    // In a real app, this would download the certificate PDF
    addToast({
      title: 'Downloading',
      description: 'Certificate PDF is being prepared',
      color: 'default',
      timeout: 2000,
    });
  };

  const truncatedHash = `${certificate.transactionHash.slice(0, 20)}...${certificate.transactionHash.slice(-20)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[10px] border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <CloseIcon className="w-4 h-4 text-neutral-950" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold text-[#0f172b] mb-6 pr-8">
            Certificate Verification Proof
          </h2>

          <div className="flex flex-col gap-6">
            {/* Certificate Display */}
            <div className="border-4 border-blue-200 rounded-[10px] p-9 relative">
              {/* Verified Badge */}
              <div className="absolute top-5 right-5 bg-[#00c950] rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                <CheckCircleIcon className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">Verified</span>
              </div>

              <div className="flex flex-col gap-6 items-center">
                {/* Certificate Header */}
                <div className="flex flex-col gap-1 items-center">
                  <p className="text-sm text-[#62748e] uppercase tracking-wider text-center">
                    Certificate of Completion
                  </p>
                  <h3 className="text-base font-medium text-[#0f172b] text-center">
                    {certificate.courseName}
                  </h3>
                </div>

                {/* Awarded To */}
                <div className="flex flex-col gap-1 items-center">
                  <p className="text-base text-[#314158]">Awarded to</p>
                  <p className="text-base font-bold text-[#314158]">
                    {certificate.studentName}
                  </p>
                </div>

                {/* Issuer */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                    <CertificateIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#62748e]">Issued by</p>
                    <p className="text-base font-medium text-[#0f172b]">
                      {certificate.issuer}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-sm text-[#45556c] text-center">
                  Date: {certificate.issueDate}
                </p>
              </div>
            </div>

            {/* Issuer Verification Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-[14px] p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[10px] border-2 border-gray-300 bg-white flex items-center justify-center">
                  <CertificateIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-medium text-[#0f172b]">
                    {certificate.issuer}
                  </p>
                  <p className="text-sm text-[#45556c]">
                    Verified Issuing Authority
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Record Confirmation */}
            <div className="bg-gradient-to-r from-[#1c398e] to-[#193cb8] rounded-[14px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <BlockchainIcon className="w-5 h-5 text-white" />
                <h4 className="text-base text-white font-medium">
                  Blockchain Record Confirmation
                </h4>
              </div>

              <div className="flex flex-col gap-4">
                {/* Transaction Hash */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#bedbff] uppercase tracking-wider">
                    Transaction Hash / Proof ID
                  </p>
                  <div className="flex gap-2 items-center">
                    <div className="bg-[#162456] flex-1 rounded px-4 py-3">
                      <p className="font-mono text-sm text-white break-all">
                        {truncatedHash}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyHash}
                      className="bg-transparent hover:bg-white/10 rounded-lg p-2 transition-colors"
                      aria-label="Copy transaction hash"
                    >
                      <CopyIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#bedbff] leading-relaxed">
                  This certificate is permanently recorded on the Ethereum
                  blockchain and cannot be altered or revoked.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="solid"
                className="flex-1 bg-[#155dfc] text-white flex items-center justify-center gap-1.5"
                onPress={handleViewOnExplorer}
              >
                <ExternalLinkIcon className="w-4 h-4" />
                View on Explorer
              </Button>
              <Button
                variant="bordered"
                className="flex-1 border-gray-200 text-neutral-950 flex items-center justify-center gap-1.5"
                onPress={handleDownloadPDF}
              >
                <DownloadIcon className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateProofModal;

