import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReadContract } from "wagmi";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import {
  Star,
  Users,
  Clock,
  Globe,
  Database,
  PlayCircle,
  FileText,
  Award,
  Smartphone,
  CheckCircle2,
  Copy,
  Infinity,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { formatEther } from "viem";

// IPFS Gateway
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// Types for course data
interface OnChainCourse {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
}

interface CourseMetadata {
  description?: string;
  shortDescription?: string;
  imageCid?: string;
  category?: string;
  rating?: number;
}

interface CourseContent {
  sections?: Array<{
    title: string;
    lessons?: Array<{
      title: string;
      content?: string;
      type?: "text" | "video";
      videoUrl?: string;
    }>;
  }>;
  imageCid?: string;
}

type TabType = "overview" | "curriculum" | "instructor";

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courseId: id } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [courseMetadata, setCourseMetadata] = useState<CourseMetadata | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Parse course ID from URL
  const courseId = id ? BigInt(id) : undefined;

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
        // Try to fetch content.json (direct CID points to content.json file)
        const contentUrl = `${IPFS_GATEWAY}${courseData.contentCid}`;
        console.log("📥 Fetching course content from:", contentUrl);

        const contentResponse = await fetch(contentUrl);
        if (contentResponse.ok) {
          const content = await contentResponse.json();
          setCourseContent(content);
          console.log("✅ Course content loaded:", content);

          // If content has imageCid, set it in metadata
          if (content.imageCid) {
            setCourseMetadata((prev) => ({
              ...prev,
              imageCid: content.imageCid,
            }));
          }
        } else {
          // If direct fetch fails, try as folder with content.json
          const folderContentUrl = `${IPFS_GATEWAY}${courseData.contentCid}/content.json`;
          console.log("📥 Trying folder structure:", folderContentUrl);

          const folderContentResponse = await fetch(folderContentUrl);
          if (folderContentResponse.ok) {
            const content = await folderContentResponse.json();
            setCourseContent(content);
            console.log("✅ Course content loaded from folder:", content);
          }

          // Try to fetch metadata.json from folder
          const metadataUrl = `${IPFS_GATEWAY}${courseData.contentCid}/metadata.json`;
          const metadataResponse = await fetch(metadataUrl);
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            setCourseMetadata(metadata);
            console.log("✅ Course metadata loaded:", metadata);
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

  const handleBack = () => {
    navigate("/");
  };

  const handleEnroll = () => {
    if (courseData) {
      navigate(`/course/${courseData.id.toString()}/learn`);
    }
  };

  const handleCopyAddress = () => {
    if (courseData?.contentCid) {
      navigator.clipboard.writeText(courseData.contentCid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate course stats
  const totalLessons = courseContent?.sections?.reduce(
    (acc, section) => acc + (section.lessons?.length || 0),
    0
  ) || 0;
  const totalSections = courseContent?.sections?.length || 0;

  // Loading state
  if (isLoadingContract || (isLoadingContent && !courseData)) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading course from blockchain & IPFS...</p>
        </div>
      </div>
    );
  }

  // Error state - contract returns Course with id=0 when not found
  if (isContractError || !courseData || courseData.id === 0n) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600 text-lg mb-4">Course not found</p>
          <Button onPress={handleBack} className="bg-blue-600 text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Build image URL
  const imageUrl = courseMetadata?.imageCid
    ? `${IPFS_GATEWAY}${courseMetadata.imageCid}`
    : courseContent?.imageCid
      ? `${IPFS_GATEWAY}${courseContent.imageCid}`
      : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop";

  // Format price
  const priceInEth = formatEther(courseData.price);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Dark Header Section */}
      <div className="bg-[#101828] relative">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="text-[#d1d5dc] text-sm mb-6 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            ← Back to Courses
          </button>

          <div className="flex gap-8">
            {/* Left Content */}
            <div className="flex-1 max-w-[800px]">
              {/* Badge */}
              <div className="inline-block bg-[#155dfc] text-white text-xs px-2 py-1 rounded-lg mb-4">
                {courseMetadata?.category || "Blockchain"}
              </div>

              {/* Title */}
              <h1 className="text-white text-2xl font-semibold mb-2">
                {courseData.title}
              </h1>

              {/* Subtitle */}
              <p className="text-[#d1d5dc] text-base mb-4">
                {courseMetadata?.shortDescription ||
                  courseMetadata?.description ||
                  "Learn and master this course on the blockchain"}
              </p>

              {/* Rating and Students */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-sm">
                    {courseMetadata?.rating?.toFixed(1) || "4.5"}
                  </span>
                  <span className="text-[#99a1af] text-sm">(New)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">
                    {totalLessons} lessons
                  </span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">
                    {totalSections} sections
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">English</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">Stored on IPFS</span>
                </div>
              </div>

              {/* Instructor */}
              <p className="text-[#99a1af] text-xs">
                Instructor: {courseData.instructor.slice(0, 6)}...
                {courseData.instructor.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Card - Floating */}
      <div className="max-w-[1280px] mx-auto px-8 relative">
        <div className="absolute right-8 -top-[280px] w-[384px]">
          <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Video Preview */}
            <div className="relative bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl}
                alt={courseData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 cursor-pointer hover:bg-white transition-colors">
                  <PlayCircle className="w-8 h-8 text-gray-800" />
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[#101828] text-3xl font-bold">
                    {priceInEth}
                  </span>
                  <span className="text-[#4a5565] text-xl">ETH</span>
                </div>
                <p className="text-[#6a7282] text-xs">One-time payment</p>
              </div>

              {/* Enroll Button */}
              <Button
                onPress={handleEnroll}
                className="w-full bg-[#030213] text-white rounded-lg h-10 text-sm font-normal mb-8"
              >
                Enroll Now
              </Button>

              {/* Features */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2">
                  <Infinity className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">
                    Blockchain verified
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-6"></div>

              {/* Content CID */}
              <div>
                <p className="text-[#4a5565] text-xs mb-1">Content CID</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#6a7282] text-xs font-mono flex-1 truncate">
                    {courseData.contentCid}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    title={copied ? "Copied!" : "Copy CID"}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-xs mt-1">Copied!</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-8 pt-8 pb-16">
        <div className="flex gap-8">
          {/* Left Content - Tabs */}
          <div className="flex-1 max-w-[800px]">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${activeTab === "overview"
                    ? "border-[#101828] text-[#0a0a0a]"
                    : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${activeTab === "curriculum"
                    ? "border-[#101828] text-[#0a0a0a]"
                    : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                    }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab("instructor")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${activeTab === "instructor"
                    ? "border-[#101828] text-[#0a0a0a]"
                    : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                    }`}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* Tab Content - Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* About this course */}
                <div>
                  <h2 className="text-[#0a0a0a] text-xl mb-4">
                    About this course
                  </h2>
                  <p className="text-[#4a5565] text-base leading-relaxed">
                    {courseMetadata?.description ||
                      `This course "${courseData.title}" is stored on the blockchain and IPFS, ensuring permanent access and ownership verification.`}
                  </p>
                </div>

                {/* What you'll learn */}
                <div>
                  <h2 className="text-[#0a0a0a] text-base mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {courseContent?.sections?.slice(0, 6).map((section, index) => (
                      <div key={index} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-[#364153] text-base">{section.title}</p>
                      </div>
                    ))}
                    {(!courseContent?.sections || courseContent.sections.length === 0) && (
                      <>
                        <div className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <p className="text-[#364153] text-base">Comprehensive course content</p>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <p className="text-[#364153] text-base">Blockchain verified certificate</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h2 className="text-[#0a0a0a] text-base mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    <li className="flex gap-3 text-[#4a5565] text-base">
                      <span className="text-[#99a1af]">•</span>
                      <span>MetaMask wallet installed</span>
                    </li>
                    <li className="flex gap-3 text-[#4a5565] text-base">
                      <span className="text-[#99a1af]">•</span>
                      <span>Basic understanding of blockchain</span>
                    </li>
                    <li className="flex gap-3 text-[#4a5565] text-base">
                      <span className="text-[#99a1af]">•</span>
                      <span>A computer with internet connection</span>
                    </li>
                  </ul>
                </div>

                {/* Content Error Warning */}
                {contentError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800 text-sm">{contentError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content - Curriculum */}
            {activeTab === "curriculum" && (
              <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">Course Curriculum</h2>
                {isLoadingContent ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading curriculum...</span>
                  </div>
                ) : courseContent?.sections && courseContent.sections.length > 0 ? (
                  <div className="space-y-4">
                    {courseContent.sections.map((section, sectionIndex) => (
                      <div
                        key={sectionIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            Section {sectionIndex + 1}: {section.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {section.lessons?.length || 0} lessons
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {section.lessons?.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="px-4 py-3 flex items-center gap-3"
                            >
                              {lesson.type === "video" ? (
                                <PlayCircle className="w-4 h-4 text-gray-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-gray-700 text-sm">
                                {lesson.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#4a5565] text-base">
                    Curriculum content will be available after enrollment.
                  </p>
                )}
              </div>
            )}

            {/* Tab Content - Instructor */}
            {activeTab === "instructor" && (
              <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">
                  About the Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {courseData.instructor.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-1">
                      Wallet Address
                    </h3>
                    <p className="text-gray-500 text-sm font-mono mb-2">
                      {courseData.instructor}
                    </p>
                    <p className="text-gray-600 text-sm">
                      This course was created and deployed by the instructor at the
                      address above. All course content is stored on IPFS and verified
                      on the blockchain.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Course Includes & IPFS Info */}
          <div className="w-[384px] space-y-6 mt-[320px]">
            {/* Course Includes Card */}
            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#0a0a0a] text-base mb-5">Course includes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {totalLessons} lessons
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {totalSections} sections
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    Access on mobile and desktop
                  </span>
                </div>
              </div>
            </Card>

            {/* IPFS Storage Card */}
            <Card className="bg-[#f9fafb] border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#155dfc] rounded-lg w-10 h-10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#4a5565] text-sm">Stored on</p>
                  <p className="text-[#0a0a0a] text-base font-normal">
                    IPFS Network (Pinata)
                  </p>
                </div>
              </div>
              <p className="text-[#6a7282] text-xs font-mono break-all">
                {courseData.contentCid}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
