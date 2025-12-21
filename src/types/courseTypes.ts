// Shared types for course data

export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export interface OnChainCourse {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
}

export interface CourseMetadata {
  title?: string;
  description?: string;
  shortDescription?: string;
  imageCid?: string;
  category?: string;
  rating?: number;
  contentCid?: string;
}

export interface CourseLesson {
  title: string;
  content?: string;
  type?: "text" | "video";
  fileCid?: string;  // IPFS CID for video content
  fileUrl?: string; // IPFS gateway URL for video
}

export interface CourseSection {
  title: string;
  lessons?: CourseLesson[];
}

export interface CourseContent {
  sections?: CourseSection[];
  imageCid?: string;
}

export type TabType = "overview" | "curriculum" | "instructor";

// Helper to build IPFS image URL
export const buildImageUrl = (
  metadata?: CourseMetadata | null,
  content?: CourseContent | null
): string => {
  if (metadata?.imageCid) {
    return `${IPFS_GATEWAY}${metadata.imageCid}`;
  }
  if (content?.imageCid) {
    return `${IPFS_GATEWAY}${content.imageCid}`;
  }
  return "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop";
};

// Helper to calculate course stats
export const calculateCourseStats = (content?: CourseContent | null) => {
  const totalSections = content?.sections?.length || 0;
  const totalLessons =
    content?.sections?.reduce(
      (acc, section) => acc + (section.lessons?.length || 0),
      0
    ) || 0;
  return { totalSections, totalLessons };
};
