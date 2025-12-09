import React, { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { addToast } from "@heroui/toast";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import Header from "@/components/Header";
import PartnerLogosSection from "@/components/PartnerLogosSection";
import TrendingSection from "@/components/TrendingSection";
import HotReleasesSection from "@/components/HotReleasesSection";
import AllCoursesSection from "@/components/AllCoursesSection";
import CategoriesSection from "@/components/CategoriesSection";
import { categoryOptions } from "../schemas/courseForm";

interface OnChainCourse {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
}

interface Course extends OnChainCourse {
  metadata?: {
    description: string;
    imageCid: string;
    category: string;
    rating: number;
  };
}

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Thêm 'error' để lấy đối tượng lỗi chi tiết từ wagmi
  const {
    data: onChainCourses,
    isLoading: isLoadingOnChain,
    isError: isReadError,
    error: readError, // <--- Lấy đối tượng lỗi cụ thể
  } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: 'nextCourseId',
  }) as { data?: bigint, isError: boolean };

  const fetchCourses = useCallback(async (total: number) => {
    setLoading(true);

    if (!publicClient) {
      console.error('⚠️ publicClient is undefined. Ensure WagmiConfig is set up properly.');
      setLoading(false);
      return;
    }

    try {
      const coursePromises = Array.from({ length: total }, (_, i) =>
        publicClient.readContract({
          address: elearningPlatformAddress,
          abi: elearningPlatformABI,
          functionName: 'courses',
          args: [BigInt(i + 1)],
        })
      );

      const courseData = await Promise.all(coursePromises);

      const fetchedCourses = await Promise.all(
        courseData.map(async (course: any) => {
          const [id, instructor, price, title, contentCid] = course;
          let metadata = undefined;

          try {
            // Fetch content.json from IPFS (which contains imageCid)
            const contentUrl = `${IPFS_GATEWAY}${contentCid}`;
            const contentRes = await fetch(contentUrl);
            
            if (contentRes.ok) {
              const contentData = await contentRes.json();
              
              // Extract imageCid from content.json if available
              if (contentData.imageCid) {
                metadata = {
                  imageCid: contentData.imageCid,
                  description: contentData.description,
                  shortDescription: contentData.shortDescription,
                  category: contentData.category,
                  rating: contentData.rating || 4.5,
                };
              }
            }
          } catch (err) {
            console.warn(`⚠️ Lỗi tải nội dung từ IPFS (${contentCid}):`, err);
          }
          
          return { id, instructor, price, title, contentCid, metadata };
        })
      );

      setCourses(fetchedCourses.filter(Boolean) as Course[]);
    } catch (err) {
      console.error('❌ Fetch courses error:', err);
      addToast({
        title: 'Lỗi',
        description: 'Không thể tải khóa học từ blockchain.',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }, [publicClient]);
    functionName: "getAllCourse",
  }) as {
    data?: OnChainCourse[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null; // Cập nhật kiểu dữ liệu cho error
  };

  useEffect(() => {
    const fetchMetadataAndSetState = async () => {
      if (isLoadingOnChain) {
        return;
      }

      // Xử lý lỗi đọc contract
      if (isReadError) {
        const errorDescription = readError
          ? readError.message.split("\n")[0] // Lấy dòng đầu tiên của thông báo lỗi
          : "Lỗi không xác định khi tải từ Blockchain.";

        console.error("❌ Lỗi đọc getAllCourses:", readError);

        addToast({
          title: "Lỗi Blockchain",
          description: `Không thể tải danh sách khóa học: ${errorDescription}`,
          color: "danger",
        });

        setLoading(false);
        return;
      }

      if (!onChainCourses || onChainCourses.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        const fetchedCourses = await Promise.all(
          onChainCourses.map(async (course) => {
            let metadata = undefined;

            try {
              const url = `${IPFS_GATEWAY}${course.contentCid}/metadata.json`;
              const res = await fetch(url);

              if (res.ok) {
                const data = await res.json();

                // Đảm bảo rating là số và có giá trị mặc định
                metadata = {
                  ...data,
                  rating: Number(data.rating) || 4.5,
                };
              }
            } catch (err) {
              console.warn(
                `⚠️ Lỗi tải metadata từ IPFS (${course.contentCid}):`,
                err,
              );
            }

            return { ...course, metadata };
          }),
        );

        // TypeScript guard: lọc ra các phần tử không phải là Course (nếu có lỗi logic)
        setCourses(fetchedCourses.filter(Boolean) as Course[]);
      } catch (err) {
        console.error("❌ Lỗi fetch metadata:", err);
        // Nếu lỗi fetch metadata, vẫn hiển thị các khóa học on-chain nếu có
        setCourses(
          onChainCourses.map((c) => ({ ...c, metadata: undefined })),
        );
        addToast({
          title: "Lỗi",
          description: "Không thể tải metadata từ IPFS. Dữ liệu hiển thị có thể thiếu.",
          color: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetadataAndSetState();
  }, [onChainCourses, isLoadingOnChain, isReadError, readError]); // Thêm readError vào dependency array

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium">
          Đang tải khóa học từ blockchain & IPFS...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PartnerLogosSection />

      {courses.length > 0 ? (
        <>
          <TrendingSection courses={courses} />
          <HotReleasesSection courses={courses.slice(-4).reverse()} />
          <AllCoursesSection courses={courses} />
        </>
      ) : (
        <div className="text-center py-20 px-8">
          <p className="text-xl text-gray-600">
            {/* Hiển thị thông báo phù hợp khi có lỗi */}
            {isReadError ? (
              <>
                Không thể tải dữ liệu. Vui lòng kiểm tra lại **kết nối mạng** và **địa chỉ contract**.
              </>
            ) : (
              <>
                Chưa có khóa học nào được tạo. Hãy tạo khóa học đầu tiên!
              </>
            )}
          </p>
        </div>
      )}

      <CategoriesSection categories={categoryOptions} />
    </div>
  );
};

export default Home;