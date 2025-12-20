import React, { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { elearningPlatformABI, elearningPlatformAddress } from '@/contracts/ElearningPlatform';
import { uploadCertificateToIPFS, CertificateData } from '@/services/certificateService';
import { addToast } from '@heroui/toast';
import { Button } from '@heroui/button';

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface ClaimCertificateProps {
  courseId: string;
  courseName: string;
  instructorAddress: string;
  onSuccess?: (imageCID: string) => void;
}

export const ClaimCertificate: React.FC<ClaimCertificateProps> = ({
  courseId,
  courseName,
  instructorAddress,
  onSuccess,
}) => {
  const { address } = useAccount();
  const { writeContract, isPending, isSuccess, error: txError } = useWriteContract();
  const [claiming, setClaiming] = useState(false);
  const [uploadedImageCID, setUploadedImageCID] = useState<string | null>(null);

  const handleClaimCertificate = async () => {
    if (!address) {
      addToast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to claim certificate',
        color: 'danger',
        timeout: 3000,
      });
      return;
    }

    setClaiming(true);
    setUploadedImageCID(null);

    try {
      // 1. Prepare certificate data
      const completionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const certificateData: CertificateData = {
        studentName: address,
        studentAddress: address,
        courseName,
        instructorAddress,
        completionDate,
        courseId,
      };

      console.log('🎓 Starting certificate claim process...');
      
      addToast({
        title: 'Step 1/3: Generating Certificate',
        description: 'Creating your certificate SVG and uploading to IPFS...',
        color: 'default',
        timeout: 5000,
      });

      // 2. Upload certificate to IPFS
      const { metadataURI, imageCID } = await uploadCertificateToIPFS(certificateData);
      
      console.log('✅ Certificate uploaded to IPFS');
      console.log('📷 Image CID:', imageCID);
      console.log('📄 Metadata URI:', metadataURI);
      
      // Store the image CID
      setUploadedImageCID(imageCID);

      addToast({
        title: 'Step 2/3: Minting NFT',
        description: 'Please confirm the transaction in your wallet...',
        color: 'default',
        timeout: 10000,
      });

      // 3. Call smart contract to mint certificate
      console.log('📝 Calling contract claimCertificate...');
      writeContract({
        address: elearningPlatformAddress,
        abi: elearningPlatformABI,
        functionName: 'claimCertificate',
        args: [
          BigInt(courseId),
          metadataURI,
          courseName,
          address,
          completionDate,
        ],
      });

    } catch (error) {
      console.error('❌ Error in claim process:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to claim certificate',
        color: 'danger',
        timeout: 5000,
      });
      setClaiming(false);
      setUploadedImageCID(null);
    }
  };

  // Handle transaction error
  React.useEffect(() => {
    if (txError) {
      console.error('❌ Transaction error:', txError);
      addToast({
        title: 'Transaction Failed',
        description: txError.message || 'Failed to mint certificate NFT',
        color: 'danger',
        timeout: 5000,
      });
      setClaiming(false);
      setUploadedImageCID(null);
    }
  }, [txError]);

  // Handle success
  React.useEffect(() => {
    if (isSuccess && uploadedImageCID) {
      console.log('✅ Certificate minted successfully!');
      addToast({
        title: 'Certificate Claimed! 🎉',
        description: 'Your NFT certificate has been minted successfully!',
        color: 'success',
        timeout: 5000,
      });
      setClaiming(false);
      onSuccess?.(uploadedImageCID);
    }
  }, [isSuccess, uploadedImageCID, onSuccess]);

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-3xl">🎓</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Congratulations! Course Completed
          </h3>
          <p className="text-sm text-gray-600">
            {claiming 
              ? 'Processing your certificate...' 
              : "You've completed all lessons. Claim your NFT certificate now!"
            }
          </p>
        </div>

        <Button
          size="lg"
          className="bg-green-600 text-white hover:bg-green-700 font-semibold disabled:opacity-50"
          onPress={handleClaimCertificate}
          disabled={claiming || isPending}
        >
          {claiming || isPending ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              {isPending ? 'Confirming...' : 'Claiming...'}
            </>
          ) : (
            <>
              <span className="mr-2">🏆</span>
              Claim Certificate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface CertificateViewerProps {
  courseId: string;
  studentAddress: string;
}

export const CertificateViewer: React.FC<CertificateViewerProps> = ({
  courseId,
  studentAddress,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [certificateImageCID, setCertificateImageCID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get certificate token ID
  const { data: certificateTokenId } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: 'getCertificateTokenId',
    args: [studentAddress as `0x${string}`, BigInt(courseId)],
  }) as { data?: bigint };

  // Fetch certificate metadata from IPFS to get image CID
  useEffect(() => {
    const fetchCertificateImage = async () => {
      if (!certificateTokenId || certificateTokenId === BigInt(0)) {
        setLoading(false);
        return;
      }

      try {
        // In production, you would query the CertificateNFT contract for tokenURI
        // For now, we'll use a placeholder or store the imageCID in localStorage
        const storedCID = localStorage.getItem(`cert_image_${courseId}`);
        if (storedCID) {
          setCertificateImageCID(storedCID);
        }
      } catch (error) {
        console.error('Error fetching certificate image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateImage();
  }, [certificateTokenId, courseId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading certificate...</div>;
  }

  if (!certificateTokenId || certificateTokenId === BigInt(0)) {
    return null;
  }

  return (
    <>
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ✓ Certificate Awarded
            </h3>
            <p className="text-sm text-gray-600">
              You have earned your completion certificate for this course!
            </p>
          </div>

          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            onPress={() => setShowModal(true)}
          >
            <span className="mr-2">👁️</span>
            View Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Certificate
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                {certificateImageCID ? (
                  <img
                    src={`${IPFS_GATEWAY}${certificateImageCID}`}
                    alt="Certificate"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <span className="text-6xl mb-4">🎓</span>
                    <p className="text-gray-600">Certificate image not available</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {certificateImageCID && (
                  <>
                    <a
                      href={`${IPFS_GATEWAY}${certificateImageCID}`}
                      download
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 text-center"
                    >
                      📥 Download Certificate
                    </a>
                    <a
                      href={`${IPFS_GATEWAY}${certificateImageCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 text-center"
                    >
                      🔗 Open in IPFS
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
