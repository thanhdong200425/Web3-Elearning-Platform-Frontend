import { CourseFormData } from "@/schemas/courseForm";
import {
  uploadCourseContent,
  uploadCourseImage,
  uploadCourseMetadata,
} from "./ipfs";

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

    // Validate cover image is uploaded
    if (!course.coverImage) {
      throw new Error(
        "Cover image is required. Please upload a cover image before deploying."
      );
    }

    // Step 1: Upload cover image to IPFS (required before deployment)
    let imageCid: string | undefined;
    onProgress?.("Uploading cover image to IPFS...");
    imageCid = await uploadCourseImage(course.coverImage);

    // Step 2: Upload course content (sections and lessons)
    const contentCid = await uploadCourseContent(
      course.sections || [],
      imageCid
    );

    // Step 3: Upload metadata (optional, for better organization)
    let metadataCid = "";
    try {
      onProgress?.("Uploading course metadata to IPFS...");
      const metadata = {
        title: course.title,
        description: course.detailedDescription || course.shortDescription,
        shortDescription: course.shortDescription,
        imageCid: imageCid,
        category: course.category,
        contentCid: contentCid,
        rating: 0,
      };
      metadataCid = await uploadCourseMetadata(metadata);
    } catch (metadataError) {
      console.error(
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
