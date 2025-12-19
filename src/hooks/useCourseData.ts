import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import {
    elearningPlatformABI,
    elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import {
    OnChainCourse,
    CourseMetadata,
    CourseContent,
    IPFS_GATEWAY,
} from "@/types/courseTypes";

interface UseCourseDataResult {
    courseData: OnChainCourse | undefined;
    courseContent: CourseContent | null;
    courseMetadata: CourseMetadata | null;
    isLoading: boolean;
    isLoadingContent: boolean;
    isError: boolean;
    contentError: string | null;
}

export function useCourseData(courseId: bigint | undefined): UseCourseDataResult {
    const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
    const [courseMetadata, setCourseMetadata] = useState<CourseMetadata | null>(null);
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
                const primaryUrl = `${IPFS_GATEWAY}${courseData.contentCid}`;
                console.log("📥 Fetching from contentCid:", primaryUrl);

                const primaryResponse = await fetch(primaryUrl);
                if (primaryResponse.ok) {
                    const primaryData = await primaryResponse.json();
                    console.log("📄 Primary data loaded:", primaryData);

                    // Check if this is metadata (has contentCid field pointing to actual content)
                    if (primaryData.contentCid && !primaryData.sections) {
                        setCourseMetadata(primaryData);
                        console.log("✅ Course metadata loaded:", primaryData);

                        const contentUrl = `${IPFS_GATEWAY}${primaryData.contentCid}`;
                        console.log("📥 Fetching course content from:", contentUrl);

                        const contentResponse = await fetch(contentUrl);
                        if (contentResponse.ok) {
                            const contentData = await contentResponse.json();
                            setCourseContent(contentData);
                            console.log("✅ Course content loaded:", contentData);
                        } else {
                            console.warn("⚠️ Could not fetch content from metadata.contentCid");
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
                    const folderContentUrl = `${IPFS_GATEWAY}${courseData.contentCid}/content.json`;
                    const folderContentResponse = await fetch(folderContentUrl);
                    if (folderContentResponse.ok) {
                        const content = await folderContentResponse.json();
                        setCourseContent(content);
                    }

                    const metadataUrl = `${IPFS_GATEWAY}${courseData.contentCid}/metadata.json`;
                    const metadataResponse = await fetch(metadataUrl);
                    if (metadataResponse.ok) {
                        const metadata = await metadataResponse.json();
                        setCourseMetadata(metadata);
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
    };
}
