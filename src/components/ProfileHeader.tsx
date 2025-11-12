import React from 'react';
import { CopyIcon, CheckCircleIcon } from './icons';

interface ProfileHeaderProps {
  name: string;
  studentId: string;
  walletAddress: string;
  avatarUrl?: string;
  onCopyWallet?: () => void;
  isVerified?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  studentId,
  walletAddress,
  avatarUrl,
  onCopyWallet,
  isVerified = true,
}) => {
  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      onCopyWallet?.();
    }
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  return (
    <div className="bg-white border-t-4 border-blue-500 border border-gray-200 rounded-[14px] p-6 relative">
      <div className="flex flex-col items-center pt-12">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-blue-100 overflow-hidden bg-gray-200">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-medium">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name and Student ID */}
        <div className="flex flex-col gap-2 items-center mb-6">
          <h1 className="text-2xl font-medium text-[#0f172b]">{name}</h1>
          <p className="text-lg text-[#62748e]">{studentId}</p>
        </div>

        {/* Wallet Address Card */}
        <div className="bg-gradient-to-r from-[#1d293d] to-[#0f172b] rounded-[14px] p-4 w-full max-w-md shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-[#90a1b9]">Public Wallet Address</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-white hover:bg-white/10 rounded-lg px-2.5 py-1.5 transition-colors h-7"
            >
              <CopyIcon className="w-4 h-4" />
              <span className="text-xs">Copy</span>
            </button>
          </div>
          <div className="bg-[#020618] rounded px-3 py-2">
            <p className="font-mono text-sm text-white">{truncatedAddress}</p>
          </div>
        </div>

        {/* Verification Badge */}
        {isVerified && (
          <div className="bg-[#00c950] rounded-lg px-6 py-2 flex items-center gap-2">
            <CheckCircleIcon className="w-3 h-3 text-white" />
            <span className="text-sm text-white font-medium">
              Identity Verified • On-Chain Anchor
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

