import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReadContract, useAccount } from "wagmi";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import { addToast } from "@heroui/toast";
import Header from "@/components/layout/Header";
import BackButton from "@/components/buttons/BackButton";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface CourseContent {
  sections: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      videoUrl?: string;  // Keep for backward compatibility
      type: "text" | "video" | "document";
      fileCid?: string;   // NEW: CID of uploaded lesson file
      fileUrl?: string;   // NEW: IPFS URL (same as fileCid for now)
    }>;
  }>;
}

const CourseViewer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { address, isConnected } = useAccount();
  const [contentCid, setContentCid] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has purchased
  const { data: hasPurchased } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "hasPurchasedCourse",
    args: [address || "0x0", BigInt(courseId || "0")],
    query: {
      enabled: !!courseId && !!address && isConnected,
    },
  }) as { data?: boolean };

  // Get course content CID
  const { data: cid } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getPurchasedCourseContentCid",
    args: [address || "0x0", BigInt(courseId || "0")],
    query: {
      enabled: !!courseId && !!address && isConnected && hasPurchased === true,
    },
  }) as { data?: string };

  useEffect(() => {
    if (cid) {
      setContentCid(cid);
    }
  }, [cid]);

  const fetchCourseContent = React.useCallback(async () => {
    if (!contentCid) {
      console.error("❌ Content CID is null or undefined");
      setError("Course content CID not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CID from Pinata is the CID of the file itself, not a folder
      // So we fetch directly: {CID} instead of {CID}/content.json
      const url = `${IPFS_GATEWAY}${contentCid}`;
      console.log("📡 Fetching course content from IPFS:", url);

      const response = await fetch(url);

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        // Try alternative IPFS gateways if primary fails
        const alternativeGateways = [
          "https://gateway.pinata.cloud/ipfs/",
          "https://cloudflare-ipfs.com/ipfs/",
          "https://dweb.link/ipfs/",
        ];

        let lastError: Error | null = null;

        for (const gateway of alternativeGateways) {
          try {
            console.log(`🔄 Trying alternative gateway: ${gateway}`);
            const altUrl = `${gateway}${contentCid}`;
            const altResponse = await fetch(altUrl);

            if (altResponse.ok) {
              const content = await altResponse.json();
              console.log("✅ Successfully loaded from alternative gateway");
              setCourseContent(content);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn(`⚠️ Gateway ${gateway} failed:`, err);
            lastError = err as Error;
          }
        }

        throw new Error(
          `Cannot load content from IPFS. Status: ${response.status}. ` +
          `CID: ${contentCid}. ` +
          `Content file might not be uploaded or CID is incorrect.`
        );
      }

      const content = await response.json();
      console.log("✅ Course content loaded successfully:", content);

      // Validate content structure
      if (!content.sections || !Array.isArray(content.sections)) {
        throw new Error("Invalid content format. Missing sections array.");
      }

      setCourseContent(content);
    } catch (err) {
      console.error("❌ Error fetching course content:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Cannot load course content. Please try again later.";

      setError(errorMessage);
      addToast({
        title: "Error",
        description: errorMessage,
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [contentCid]);

  useEffect(() => {
    console.log("🔍 CourseViewer state:", {
      isConnected,
      hasPurchased,
      contentCid,
      courseId,
      address,
    });

    if (!isConnected) {
      setError("Please connect your wallet to view this course");
      setLoading(false);
      return;
    }

    if (hasPurchased === false) {
      setError(
        "You have not purchased this course. Please purchase it to view content."
      );
      setLoading(false);
      return;
    }

    if (hasPurchased === true && contentCid) {
      console.log(
        "✅ User has purchased, fetching content with CID:",
        contentCid
      );
      fetchCourseContent();
    } else if (hasPurchased === true && !contentCid) {
      console.warn("⚠️ User has purchased but CID is not available yet");
      // Don't set error, just wait for CID to load
    }
  }, [
    contentCid,
    hasPurchased,
    isConnected,
    courseId,
    address,
    fetchCourseContent,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading course content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton onBack={() => window.history.back()} />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton onBack={() => window.history.back()} />
          <div className="bg-white rounded-lg p-6 mt-6">
            <p className="text-gray-600">No course content available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton onBack={() => window.history.back()} />

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Course Content
          </h1>

          <div className="space-y-8">
            {courseContent.sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Section {sectionIndex + 1}: {section.title}
                </h2>

                <div className="space-y-6 ml-4">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <h3 className="text-xl font-medium text-gray-800 mb-3">
                        Lesson {lessonIndex + 1}: {lesson.title}
                      </h3>

                      {/* Video/File Display */}
                      {(lesson.type === "video" || lesson.type === "document") &&
                      (lesson.videoUrl || lesson.fileCid) ? (
                        <div className="mb-4">
                          {lesson.type === "video" ? (
                            <video
                              controls
                              className="w-full rounded-lg"
                              src={
                                lesson.videoUrl?.startsWith("http")
                                  ? lesson.videoUrl
                                  : lesson.fileCid
                                  ? `${IPFS_GATEWAY}${lesson.fileCid}`
                                  : lesson.videoUrl
                                  ? `${IPFS_GATEWAY}${lesson.videoUrl}`
                                  : undefined
                              }
                            >
                              Your browser does not support video.
                            </video>
                          ) : (
                            <a
                              href={
                                lesson.fileCid
                                  ? `${IPFS_GATEWAY}${lesson.fileCid}`
                                  : lesson.videoUrl
                                  ? `${IPFS_GATEWAY}${lesson.videoUrl}`
                                  : undefined
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg hover:border-red-300 transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-4">
                                {/* PDF Icon */}
                                <div className="flex-shrink-0 w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 mb-1">
                                    Lesson Document
                                  </p>
                                  <p className="text-xs text-gray-600 mb-2">
                                    PDF Document - Click to view
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-xs font-medium">
                                      PDF
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Open in new tab →
                                    </span>
                                  </div>
                                </div>

                                {/* Preview Arrow */}
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-red-500 group-hover:translate-x-1 transition-transform duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </a>
                          )}
                        </div>
                      ) : null}

                      {lesson.content && (
                        <div className="prose max-w-none">
                          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {lesson.content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Display CID for reference */}
          {contentCid && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Content CID:</p>
              <code className="text-xs bg-gray-100 p-2 rounded break-all">
                {contentCid}
              </code>
              <div className="mt-2 space-x-2">
                <a
                  href={`${IPFS_GATEWAY}${contentCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open on IPFS Gateway
                </a>
                <span className="text-xs text-gray-400">|</span>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${contentCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Try Pinata Gateway
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
