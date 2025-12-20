import { uploadFileToIPFS } from './ipfs';
import { svgToFile, generateCertificateSVG, CertificateData as CertData } from '@/utils/certificateGenerator';

// Re-export for convenience
export type { CertificateData } from '@/utils/certificateGenerator';

/**
 * Generate certificate metadata for NFT
 */
export interface CertificateMetadata {
    name: string;
    description: string;
    image: string; // IPFS URI
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
}

/**
 * Upload certificate SVG and metadata to IPFS
 * Returns the metadata URI for NFT minting
 */
export async function uploadCertificateToIPFS(
    certificateData: CertData
): Promise<{
    metadataURI: string;
    imageCID: string;
}> {
    try {
        // 1. Generate SVG
        console.log('📜 Generating certificate SVG...');
        const svgString = generateCertificateSVG(certificateData);

        //  2. Convert to File
        const svgFile = svgToFile(svgString, `certificate-${certificateData.courseId}.svg`);

        // 3. Upload SVG to IPFS
        console.log('📤 Uploading certificate image to IPFS...');
        const imageCID = await uploadFileToIPFS(svgFile);
        console.log('✅ Certificate image uploaded. CID:', imageCID);

        // 4. Create metadata
        const metadata: CertificateMetadata = {
            name: `Course Completion Certificate - ${certificateData.courseName}`,
            description: `This certificate verifies that ${certificateData.studentName} has successfully completed the course "${certificateData.courseName}" on ${certificateData.completionDate}.`,
            image: `ipfs://${imageCID}`,
            attributes: [
                {
                    trait_type: 'Course Name',
                    value: certificateData.courseName,
                },
                {
                    trait_type: 'Student',
                    value: certificateData.studentAddress,
                },
                {
                    trait_type: 'Instructor',
                    value: certificateData.instructorAddress,
                },
                {
                    trait_type: 'Completion Date',
                    value: certificateData.completionDate,
                },
                {
                    trait_type: 'Course ID',
                    value: certificateData.courseId,
                },
            ],
        };

        // 5. Upload metadata to IPFS
        console.log('📤 Uploading certificate metadata to IPFS...');
        const metadataJSON = JSON.stringify(metadata, null, 2);
        const metadataBlob = new Blob([metadataJSON], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], `certificate-metadata-${certificateData.courseId}.json`, {
            type: 'application/json',
        });

        const metadataCID = await uploadFileToIPFS(metadataFile);
        console.log('✅ Certificate metadata uploaded. CID:', metadataCID);

        const metadataURI = `ipfs://${metadataCID}`;

        return {
            metadataURI,
            imageCID,
        };
    } catch (error) {
        console.error('❌ Error uploading certificate to IPFS:', error);
        throw new Error(
            `Failed to upload certificate: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
