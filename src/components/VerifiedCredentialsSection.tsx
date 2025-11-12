import React from 'react';
import { CertificateIcon } from './icons';
import VerifiedCredentialCard from './VerifiedCredentialCard';

interface Credential {
    courseName: string;
    issuer: string;
    issueDate: string;
    onViewProof?: () => void;
}

interface VerifiedCredentialsSectionProps {
    credentials: Credential[];
}

const VerifiedCredentialsSection: React.FC<
    VerifiedCredentialsSectionProps
> = ({ credentials }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CertificateIcon className="w-6 h-6 text-[#0f172b]" />
                        <h2 className="text-base font-medium text-[#0f172b]">
                            Verified Credentials
                        </h2>
                    </div>
                    <div className="bg-green-100 rounded-lg px-3 py-1">
                        <p className="text-xs text-[#008236] font-medium">
                            {credentials.length} Certificate{credentials.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex flex-col gap-4">
                    {credentials.map((credential, index) => (
                        <VerifiedCredentialCard
                            key={index}
                            courseName={credential.courseName}
                            issuer={credential.issuer}
                            issueDate={credential.issueDate}
                            onViewProof={credential.onViewProof}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VerifiedCredentialsSection;

