import { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import {
  OnChainCourse,
  CourseMetadata,
  CourseContent,
} from "@/types/courseTypes";
import { getContentFromIPFS } from "@/services/ipfs";

interface UseCourseDataResult {
  courseData: OnChainCourse | undefined;
  courseContent: CourseContent | null;
  courseMetadata: CourseMetadata | null;
  isLoading: boolean;
  isLoadingContent: boolean;
  isError: boolean;
  contentError: string | null;
  hasPurchased: boolean;
  isCheckingPurchase: boolean;
  isInstructor: boolean;
}

export function useCourseData(
  courseId: bigint | undefined
): UseCourseDataResult {
  const { address, isConnected } = useAccount();
  const [courseContent, setCourseContent] = useState<CourseContent | null>(
    null
  );
  const [courseMetadata, setCourseMetadata] = useState<CourseMetadata | null>(
    null
  );
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // Read course from smart contract
  const {
    data: courseData,
    isLoading: isLoadingContract,
    isError: isContractError,
  } = useReadContract({
    address: elearningPlatformAddress as `0x${string}`,
    abi: elearningPlatformABI,
    functionName: "getCourseById",
    args: [courseId ?? 0n],
    query: {
      enabled: courseId !== undefined,
    },
  }) as {
    data?: OnChainCourse;
    isLoading: boolean;
    isError: boolean;
  };

  // Check if user has purchased the course
  const {
    data: hasPurchasedData,
    isLoading: isCheckingPurchase,
  } = useReadContract({
    address: elearningPlatformAddress as `0x${string}`,
    abi: elearningPlatformABI,
    functionName: "hasPurchasedCourse",
    args: [address ?? "0x0", courseId ?? 0n],
    query: {
      enabled: courseId !== undefined && isConnected && !!address,
    },
  }) as {
    data?: boolean;
    isLoading: boolean;
  };

  // Check if the current user is the instructor
  const isInstructor =
    isConnected &&
    address &&
    courseData?.instructor &&
    address.toLowerCase() === courseData.instructor.toLowerCase();

  const hasPurchased = hasPurchasedData === true || isInstructor;

  // Fetch content and metadata from IPFS/Pinata
  useEffect(() => {
    const fetchFromIPFS = async () => {
      if (!courseData?.contentCid) {
        setIsLoadingContent(false);
        return;
      }

      setIsLoadingContent(true);
      setContentError(null);

      try {
        console.log("📥 Fetching from contentCid:", courseData.contentCid);

        const primaryData = await getContentFromIPFS(courseData.contentCid);
        if (primaryData) {
          console.log("📄 Primary data loaded:", primaryData);

          // Check if this is metadata (has contentCid field pointing to actual content)
          if (primaryData.contentCid && !primaryData.sections) {
            setCourseMetadata(primaryData);
            try {
              const contentData = await getContentFromIPFS(
                primaryData.contentCid
              );
              setCourseContent(contentData);
              console.log("✅ Course content loaded:", contentData);
            } catch (error) {
              console.warn(
                "⚠️ Could not fetch content from metadata.contentCid",
                error
              );
            }
          } else if (primaryData.sections) {
            setCourseContent(primaryData);
            console.log("✅ Course content loaded directly:", primaryData);

            if (primaryData.imageCid) {
              setCourseMetadata((prev) => ({
                ...prev,
                imageCid: primaryData.imageCid,
              }));
            }
          } else {
            setCourseMetadata(primaryData);
            console.log("✅ Data loaded (unknown structure):", primaryData);
          }
        } else {
          // Try folder structure
          try {
            const content = await getContentFromIPFS(
              `${courseData.contentCid}/content.json`
            );
            setCourseContent(content);
          } catch (error) {
            console.warn(
              "⚠️ Could not fetch content.json from folder structure",
              error
            );
          }

          try {
            const metadata = await getContentFromIPFS(
              `${courseData.contentCid}/metadata.json`
            );
            setCourseMetadata(metadata);
          } catch (error) {
            console.warn(
              "⚠️ Could not fetch metadata.json from folder structure",
              error
            );
          }
        }
      } catch (error) {
        console.error("❌ Error fetching from IPFS:", error);
        setContentError("Failed to load course content from IPFS");
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFromIPFS();
  }, [courseData?.contentCid]);

  return {
    courseData,
    courseContent,
    courseMetadata,
    isLoading: isLoadingContract,
    isLoadingContent,
    isError: isContractError,
    contentError,
    hasPurchased,
    isCheckingPurchase,
    isInstructor,
  };
}
