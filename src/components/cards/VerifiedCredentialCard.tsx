import React from 'react';
import { Button } from '@heroui/button';
import { CheckCircleIcon } from './icons';

interface VerifiedCredentialCardProps {
    courseName: string;
    issuer: string;
    issueDate: string;
    onViewProof?: () => void;
}

const VerifiedCredentialCard: React.FC<VerifiedCredentialCardProps> = ({
    courseName,
    issuer,
    issueDate,
    onViewProof,
}) => {
    return (
        <div className="bg-white border-2 border-slate-200 rounded-[14px] p-6">
            <div className="flex items-start justify-between gap-4">
                {/* Left Side - Course Info */}
                <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-base font-medium text-[#0f172b]">{courseName}</h3>
                    <p className="text-sm text-[#45556c]">{issuer}</p>
                    <p className="text-xs text-[#62748e]">{issueDate}</p>
                </div>

                {/* Right Side - Badge and Button */}
                <div className="flex flex-col gap-3 items-end">
                    <div className="bg-[#00c950] rounded-lg px-3 py-1 flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3 h-3 text-white" />
                        <span className="text-xs text-white font-medium">
                            Blockchain Verified
                        </span>
                    </div>
                    <Button
                        variant="bordered"
                        size="sm"
                        onPress={onViewProof}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                        View Proof
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerifiedCredentialCard;

