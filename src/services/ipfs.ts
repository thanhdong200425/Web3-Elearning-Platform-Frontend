import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT || "",
  pinataGateway: import.meta.env.VITE_GATEWAY_URL || "",
});

// Types matching CourseFormData
interface CourseSection {
  id: string;
  title: string;
  lessons?: Array<{
    id: string;
    title: string;
    content?: string;
    file?: File;
  }>;
}

// IPFS format that CourseViewer expects
interface IPFSCourseContent {
  sections: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      videoUrl?: string;
      type: "text" | "video";
    }>;
  }>;
  imageCid?: string; // Add imageCid to content structure
}

/**
 * Convert course content from form format to IPFS format
 */
function convertToIPFSFormat(sections: CourseSection[]): IPFSCourseContent {
  return {
    sections: sections.map((section) => ({
      title: section.title,
      lessons: (section.lessons || []).map((lesson) => ({
        title: lesson.title,
        content: lesson.content || "",
        type: lesson.file ? "video" : "text",
        // Note: Video files will need to be uploaded separately
        // For now, we'll handle text content only
      })),
    })),
  };
}

/**
 * Upload file to Pinata using SDK
 */
async function uploadFileToPinata(
  file: File,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<string> {
  try {
    // Build upload chain with SDK - use public network
    // Start with the file upload
    let uploadChain = pinata.upload.public.file(file);

    // Add name if provided
    if (metadata?.name) {
      uploadChain = uploadChain.name(metadata.name);
    }

    // Add keyvalues if provided
    if (metadata?.keyvalues) {
      uploadChain = uploadChain.keyvalues(metadata.keyvalues);
    }

    // Execute upload
    const upload = await uploadChain;

    if (!upload.cid) {
      throw new Error("No CID returned from Pinata SDK");
    }

    return upload.cid;
  } catch (error) {
    console.error("❌ Pinata SDK upload error:", error);
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload a single file to IPFS using Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    console.log("📤 Uploading file to IPFS:", file.name);

    const cid = await uploadFileToPinata(file, {
      name: file.name,
      keyvalues: {
        type: "file",
      },
    });

    console.log("✅ File uploaded successfully. CID:", cid);
    return cid;
  } catch (error) {
    console.error("❌ Error uploading file to IPFS:", error);
    throw new Error(
      `Không thể upload file "${file.name}" lên IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload course content (sections and lessons) to IPFS
 * This creates a content.json file with the course structure
 */
export async function uploadCourseContent(
  sections: CourseSection[],
  imageCid?: string
): Promise<string> {
  try {
    if (!sections || sections.length === 0) {
      throw new Error("Không có nội dung khóa học để upload");
    }

    console.log("📤 Uploading course content to IPFS...");
    console.log("📋 Sections to upload:", sections.length);

    // 1. Convert format from form to IPFS format
    const formattedContent = convertToIPFSFormat(sections);

    // Add imageCid to content if provided
    if (imageCid) {
      formattedContent.imageCid = imageCid;
    }

    // 2. Create content.json file
    const contentJson = JSON.stringify(formattedContent, null, 2);
    const contentBlob = new Blob([contentJson], { type: "application/json" });
    const contentFile = new File([contentBlob], "content.json", {
      type: "application/json",
    });

    // 3. Upload to Pinata
    const cid = await uploadFileToPinata(contentFile, {
      name: `course-content-${Date.now()}`,
      keyvalues: {
        type: "course-content",
        timestamp: Date.now().toString(),
      },
    });

    console.log("✅ Course content uploaded successfully. CID:", cid);
    console.log("📄 Content structure:", formattedContent);

    return cid;
  } catch (error) {
    console.error("❌ Error uploading course content to IPFS:", error);
    throw new Error(
      `Không thể upload nội dung khóa học lên IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload course metadata (title, description, image, etc.) to IPFS
 */
export async function uploadCourseMetadata(metadata: {
  title: string;
  description?: string;
  shortDescription?: string;
  imageCid?: string;
  category?: string;
  rating?: number;
}): Promise<string> {
  try {
    console.log("📤 Uploading course metadata to IPFS...");

    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataBlob = new Blob([metadataJson], { type: "application/json" });
    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    const cid = await uploadFileToPinata(metadataFile, {
      name: `course-metadata-${Date.now()}`,
      keyvalues: {
        type: "course-metadata",
        timestamp: Date.now().toString(),
      },
    });

    console.log("✅ Course metadata uploaded successfully. CID:", cid);
    return cid;
  } catch (error) {
    console.error("❌ Error uploading course metadata to IPFS:", error);
    throw new Error(
      `Không thể upload metadata lên IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload course cover image to IPFS
 */
export async function uploadCourseImage(imageFile: File): Promise<string> {
  try {
    console.log("📤 Uploading course image to IPFS:", imageFile.name);

    const cid = await uploadFileToPinata(imageFile, {
      name: imageFile.name,
      keyvalues: {
        type: "course-image",
      },
    });

    console.log("✅ Course image uploaded successfully. CID:", cid);
    return cid;
  } catch (error) {
    console.error("❌ Error uploading course image to IPFS:", error);
    throw new Error(
      `Không thể upload hình ảnh lên IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Test Pinata connection
 */
export async function testPinataConnection(): Promise<boolean> {
  try {
    // Test authentication by attempting to list files (or use testAuthentication if available)
    await pinata.testAuthentication();
    console.log("✅ Pinata connection successful");
    return true;
  } catch (error) {
    console.error("❌ Pinata connection failed:", error);
    return false;
  }
}

/**
 * Get gateway URL for accessing IPFS content
 */
export function getGatewayUrl(cid: string): string {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || "";
  if (!gatewayUrl) {
    console.warn("⚠️ Gateway URL not configured, using default IPFS gateway");
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return `https://${gatewayUrl}/ipfs/${cid}`;
}
