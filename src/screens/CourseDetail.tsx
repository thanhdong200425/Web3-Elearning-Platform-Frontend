import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePublicClient,
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import Header from "@/components/layout/Header";
import BackButton from "@/components/buttons/BackButton";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface Course {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
  metadata?: {
    description: string;
    shortDescription: string;
    imageCid: string;
    category: string;
    rating: number;
  };
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const {
    writeContract,
    isPending,
    isSuccess,
    error: writeError,
  } = useWriteContract();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  // Read course data
  const { data: courseData } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "courses",
    args: [BigInt(courseId || "0")],
    query: {
      enabled: !!courseId,
    },
  }) as { data?: [bigint, string, bigint, string, string] };

  // Check if user has purchased
  const { data: purchased } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "hasPurchasedCourse",
    args: [address || "0x0", BigInt(courseId || "0")],
    query: {
      enabled: !!courseId && !!address && isConnected,
    },
  }) as { data?: boolean };

  useEffect(() => {
    if (courseData) {
      const [id, instructor, price, title, contentCid] = courseData;

      // Fetch content from IPFS (which may include imageCid)
      const fetchCourseData = async () => {
        try {
          // Fetch content.json from IPFS
          const contentUrl = `${IPFS_GATEWAY}${contentCid}`;
          const contentRes = await fetch(contentUrl);

          let metadata = undefined;
          let imageCid: string | undefined;

          if (contentRes.ok) {
            const contentData = await contentRes.json();

            // Extract imageCid from content.json if available
            if (contentData.imageCid) {
              imageCid = contentData.imageCid;
            }

            // Try to fetch metadata separately (for backward compatibility)
            try {
              // Note: metadataCid is not stored in contract, so we skip this for now
              // If needed, we can fetch from Pinata API using the contentCid
            } catch (metaErr) {
              // Metadata fetch is optional
            }

            // Create metadata object with imageCid
            if (imageCid) {
              metadata = {
                imageCid,
                description: contentData.description,
                shortDescription: contentData.shortDescription,
                category: contentData.category,
                rating: contentData.rating || 0,
              };
            }
          }

          setCourse({
            id,
            instructor,
            price,
            title,
            contentCid,
            metadata,
          });
        } catch (err) {
          console.error("Error fetching course data:", err);
          setCourse({
            id,
            instructor,
            price,
            title,
            contentCid,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [courseData]);

  useEffect(() => {
    if (purchased !== undefined) {
      setHasPurchased(purchased);
      setCheckingPurchase(false);
    }
  }, [purchased]);

  useEffect(() => {
    if (writeError) {
      addToast({
        title: "Lỗi",
        description:
          writeError.message || "Không thể mua khóa học. Vui lòng thử lại.",
        color: "danger",
        timeout: 5000,
      });
    }
  }, [writeError]);

  useEffect(() => {
    if (isSuccess) {
      addToast({
        title: "Thành công",
        description: "Bạn đã mua khóa học thành công!",
        color: "success",
        timeout: 5000,
      });
      setHasPurchased(true);
      // Navigate to course viewer after purchase
      setTimeout(() => {
        navigate(`/course/${courseId}/view`);
      }, 2000);
    }
  }, [isSuccess, courseId, navigate]);

  const handlePurchase = async () => {
    if (!isConnected) {
      addToast({
        title: "Chưa kết nối ví",
        description: "Vui lòng kết nối ví để mua khóa học.",
        color: "danger",
        timeout: 3000,
      });
      return;
    }

    if (!course) {
      return;
    }

    try {
      writeContract({
        address: elearningPlatformAddress,
        abi: elearningPlatformABI,
        functionName: "purchaseCourse",
        args: [course.id],
        value: course.price,
      });
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  const handleViewCourse = () => {
    navigate(`/course/${courseId}/view`);
  };

  if (loading || checkingPurchase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-xl text-gray-600">Không tìm thấy khóa học</p>
          <BackButton onBack={() => navigate("/")} />
        </div>
      </div>
    );
  }

  const imageUrl = course.metadata?.imageCid
    ? `${IPFS_GATEWAY}${course.metadata.imageCid}`
    : "https://via.placeholder.com/800x400";
  const priceInEth = formatEther(course.price);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton onBack={() => navigate("/")} />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Course Image */}
          <div className="w-full h-64 md:h-96 bg-gray-200">
            <img
              src={imageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 md:p-8">
            {/* Course Title and Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Giảng viên:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {course.instructor.substring(0, 6)}...
                    {course.instructor.substring(course.instructor.length - 4)}
                  </span>
                </div>
                {course.metadata?.category && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {course.metadata.category}
                  </span>
                )}
                {course.metadata?.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">
                      {course.metadata.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-blue-600 mb-6">
                {priceInEth} ETH
              </div>
            </div>

            {/* Description */}
            {course.metadata?.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Mô tả khóa học</h2>
                <p className="text-gray-700 leading-relaxed">
                  {course.metadata.description}
                </p>
              </div>
            )}

            {course.metadata?.shortDescription &&
              !course.metadata?.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Mô tả khóa học</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {course.metadata.shortDescription}
                  </p>
                </div>
              )}

            {/* Purchase Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      ✓ Bạn đã mua khóa học này
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onPress={handleViewCourse}
                  >
                    Xem khóa học
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!isConnected && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-800">
                        Vui lòng kết nối ví để mua khóa học
                      </p>
                    </div>
                  )}
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    onPress={handlePurchase}
                    disabled={!isConnected || isPending}
                  >
                    {isPending
                      ? "Đang xử lý..."
                      : `Mua khóa học - ${priceInEth} ETH`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
