import { CourseFormData } from "@/schemas/courseForm";
import { uploadCourseContent, uploadCourseImage, uploadCourseMetadata } from "./ipfs";

export interface CreateCourseResult {
  contentCid: string;
  imageCid?: string;
  metadataCid?: string;
}

export const createCourse = async (
  course: CourseFormData,
  onProgress?: (message: string) => void
): Promise<CreateCourseResult> => {
  try {
    // Validate required fields
    if (!course.title || course.title.trim() === "") {
      throw new Error("Course title is required");
    }

    if (!course.coursePrice || course.coursePrice <= 0) {
      throw new Error("Course price must be greater than zero");
    }

    if (!course.sections || course.sections.length === 0) {
      throw new Error("At least one section with lessons is required");
    }

    console.log("📤 Starting IPFS upload process...");
    console.log("📋 Course data:", {
      title: course.title,
      sectionsCount: course.sections?.length || 0,
      hasImage: !!course.coverImage,
    });

    // Step 1: Upload cover image if provided
    let imageCid: string | undefined;
    if (course.coverImage) {
      try {
        onProgress?.("Uploading course image to IPFS...");
        imageCid = await uploadCourseImage(course.coverImage);
        console.log("✅ Course image uploaded. CID:", imageCid);
      } catch (imageError) {
        console.warn(
          "⚠️ Failed to upload image, continuing without image:",
          imageError
        );
        // Continue without image if upload fails
      }
    }

    // Step 2: Upload course content (sections and lessons)
    onProgress?.("Uploading course content to IPFS...");
    const contentCid = await uploadCourseContent(
      course.sections || [],
      imageCid
    );
    console.log("✅ Course content uploaded. CID:", contentCid);

    // Step 3: Upload metadata (optional, for better organization)
    let metadataCid: string | undefined;
    try {
      onProgress?.("Uploading course metadata to IPFS...");
      const metadata = {
        title: course.title,
        description: course.detailedDescription || course.shortDescription,
        shortDescription: course.shortDescription,
        imageCid: imageCid,
        category: course.category,
        rating: 0,
      };
      metadataCid = await uploadCourseMetadata(metadata);
      console.log("✅ Course metadata uploaded. CID:", metadataCid);
    } catch (metadataError) {
      console.warn(
        "⚠️ Failed to upload metadata, continuing with content CID only:",
        metadataError
      );
    }

    return {
      contentCid,
      imageCid,
      metadataCid,
    };
  } catch (error) {
    console.error("❌ Error creating course:", error);
    throw error;
  }
};
