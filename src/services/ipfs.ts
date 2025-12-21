// Pinata API configuration - using direct API calls instead of SDK for browser compatibility
const PINATA_API_URL = "https://api.pinata.cloud";

// Get Pinata API credentials
export const getPinataCredentials = () => {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY || "";
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET || "";
  const ipfsGateway = import.meta.env.VITE_GATEWAY_URL || "";

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Pinata API credentials not found. Please set VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your .env file."
    );
  }

  return { apiKey, apiSecret, ipfsGateway };
};

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
      type: "text" | "video" | "document";
      fileCid?: string; // NEW: CID of uploaded lesson file
      fileUrl?: string; // NEW: IPFS URL constructed from CID
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
 * Upload file to Pinata using direct API call
 */
async function uploadFileToPinata(
  file: File,
  metadata?: { name?: string; keyvalues?: Record<string, string> }
): Promise<string> {
  const { apiKey, apiSecret } = getPinataCredentials();

  const formData = new FormData();
  formData.append("file", file);

  // Add metadata if provided
  if (metadata) {
    const pinataMetadata: any = {};
    if (metadata.name) {
      pinataMetadata.name = metadata.name;
    }
    if (metadata.keyvalues) {
      pinataMetadata.keyvalues = metadata.keyvalues;
    }
    formData.append("pinataMetadata", JSON.stringify(pinataMetadata));
  }

  // Add options
  const pinataOptions = {
    cidVersion: 1,
  };
  formData.append("pinataOptions", JSON.stringify(pinataOptions));

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pinata API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  return result.IpfsHash;
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
 * Detect file type based on file extension and MIME type
 */
function detectFileType(file: File): "text" | "video" | "document" {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Video formats
  if (
    mimeType.startsWith("video/") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".webm") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".avi") ||
    fileName.endsWith(".mkv")
  ) {
    return "video";
  }

  // Document formats (PDF, Word, etc.)
  if (
    mimeType === "application/pdf" ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".ppt") ||
    fileName.endsWith(".pptx") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return "document";
  }

  // Default to document for any other file
  return "document";
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

    // 1. Upload lesson files first and build formatted content
    const sectionsWithFiles = await Promise.all(
      sections.map(async (section) => {
        const lessons = await Promise.all(
          (section.lessons || []).map(async (lesson) => {
            let fileCid: string | undefined;
            let fileType: "text" | "video" | "document" = "text";

            // Upload file if exists
            if (lesson.file) {
              console.log(`📤 Uploading lesson file: ${lesson.file.name}`);
              try {
                // Detect file type
                fileType = detectFileType(lesson.file);
                console.log(`📝 Detected file type: ${fileType}`);

                fileCid = await uploadFileToIPFS(lesson.file);
                console.log(`✅ Lesson file uploaded. CID: ${fileCid}`);
              } catch (fileError) {
                console.error(
                  `❌ Failed to upload lesson file: ${lesson.file.name}`,
                  fileError
                );
                // Continue without file if upload fails
              }
            }

            return {
              title: lesson.title,
              content: lesson.content || "",
              type: fileType, // Use detected type
              fileCid, // NEW: Store the uploaded file CID
              fileUrl: fileCid ? fileCid : undefined, // NEW: Store CID for direct reference
            };
          })
        );

        return {
          title: section.title,
          lessons,
        };
      })
    );

    // 2. Build formatted content with uploaded file CIDs
    const formattedContent: IPFSCourseContent = {
      sections: sectionsWithFiles,
      imageCid,
    };

    // 3. Create content.json file
    const contentJson = JSON.stringify(formattedContent, null, 2);
    const contentBlob = new Blob([contentJson], { type: "application/json" });
    const contentFile = new File([contentBlob], "content.json", {
      type: "application/json",
    });

    // 4. Upload to Pinata
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
    const { apiKey, apiSecret } = getPinataCredentials();

    const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
      method: "GET",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    console.log("✅ Pinata connection successful:", result);
    return result.authenticated === true;
  } catch (error) {
    console.error("❌ Pinata connection failed:", error);
    return false;
  }
}

export const getContentFromIPFS = async (cid: string) => {
  try {
    const { ipfsGateway } = getPinataCredentials();
    const response = await fetch(`https://${ipfsGateway}/ipfs/${cid}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cannot get content from IPFS: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Error getting content from IPFS:", error);
    throw new Error(
      `Cannot get content from IPFS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
