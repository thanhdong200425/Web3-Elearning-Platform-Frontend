import React, { useState } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import PersonalDetailsCard from '../components/PersonalDetailsCard';
import VerifiedCredentialsSection from '../components/VerifiedCredentialsSection';
import CertificateProofModal from '../components/CertificateProofModal';
import { addToast } from '@heroui/toast';

interface StudentProfileProps {
    studentData?: {
        name: string;
        studentId: string;
        walletAddress: string;
        avatarUrl?: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        institution: string;
        major: string;
        credentials: Array<{
            courseName: string;
            issuer: string;
            issueDate: string;
            transactionHash?: string;
        }>;
    };
}

const StudentProfile: React.FC<StudentProfileProps> = ({
    studentData,
}) => {
    const [selectedCertificate, setSelectedCertificate] = useState<{
        courseName: string;
        studentName: string;
        issuer: string;
        issueDate: string;
        transactionHash: string;
    } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Default data - in a real app, this would come from props or API
    const defaultData = {
        name: 'Nguyen Van An',
        studentId: 'STU-2025-001',
        walletAddress: '0xABc123456789012345678901234567890123456D',
        avatarUrl: undefined,
        email: 'nguyenvanan@example.edu',
        phone: '+84 912 345 678',
        dateOfBirth: 'January 15, 2000',
        institution: 'Đại học Quốc gia TP.HCM',
        major: 'Computer Science & Blockchain Technology',
        credentials: [
            {
                courseName: 'Blockchain Fundamentals',
                issuer: 'EduTech Institute',
                issueDate: '10/25/2025',
                transactionHash:
                    '0x8f3d5c2a9b1e6f4d7c8e3a2b5d9f1e4c6a8b2d5f7e3c1a4b6d8f2e5c7a9b3d1e',
            },
            {
                courseName: 'Smart Contract Development',
                issuer: 'Web3 Academy',
                issueDate: '09/12/2025',
                transactionHash:
                    '0x9a4e6d3c1b8f2e5d7c9a3b6d4f1e8c2a5b9d7e3f1c4a6b8d2e5c7a9b3d1f4e',
            },
            {
                courseName: 'DeFi & Token Economics',
                issuer: 'Crypto Learning Hub',
                issueDate: '08/03/2025',
                transactionHash:
                    '0x7b5c3e9f2d8a1c6b4e7d9f3a2c5b8e1d4f7a9c3b6e2d5f8a1c4b7e9d2f5a8c',
            },
        ],
    };

    const data = studentData || defaultData;

    const handleCopyWallet = () => {
        addToast({
            title: 'Copied!',
            description: 'Wallet address copied to clipboard',
            color: 'success',
            timeout: 2000,
        });
    };

    const handleViewProof = (credential: {
        courseName: string;
        issuer: string;
        issueDate: string;
        transactionHash?: string;
    }) => {
        setSelectedCertificate({
            courseName: credential.courseName,
            studentName: data.name,
            issuer: credential.issuer,
            issueDate: credential.issueDate,
            transactionHash:
                credential.transactionHash ||
                '0x8f3d5c2a9b1e6f4d7c8e3a2b5d9f1e4c6a8b2d5f7e3c1a4b6d8f2e5c7a9b3d1e',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCertificate(null);
    };

    const credentialsWithHandlers = data.credentials.map((cred) => ({
        ...cred,
        onViewProof: () => handleViewProof(cred),
    }));

    return (
        <div
            className="min-h-screen p-12"
            style={{
                background:
                    'linear-gradient(127.68deg, rgba(248, 250, 252, 1) 0%, rgba(239, 246, 255, 1) 100%)',
            }}
        >
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                {/* Profile Header */}
                <ProfileHeader
                    name={data.name}
                    studentId={data.studentId}
                    walletAddress={data.walletAddress}
                    avatarUrl={data.avatarUrl}
                    onCopyWallet={handleCopyWallet}
                    isVerified={true}
                />

                {/* Personal Details */}
                <PersonalDetailsCard
                    email={data.email}
                    phone={data.phone}
                    dateOfBirth={data.dateOfBirth}
                    institution={data.institution}
                    major={data.major}
                />

                {/* Verified Credentials */}
                <VerifiedCredentialsSection credentials={credentialsWithHandlers} />
            </div>

            {/* Certificate Proof Modal */}
            {selectedCertificate && (
                <CertificateProofModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    certificate={selectedCertificate}
                />
            )}
        </div>
    );
};

export default StudentProfile;

