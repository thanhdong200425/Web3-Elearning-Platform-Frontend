import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi'; 
import { addToast } from '@heroui/toast';
import { elearningPlatformABI, elearningPlatformAddress } from '@/contracts/ElearningPlatform';
import Header from '@/components/Header';
import MainTitle from '@/components/MainTitle';
import TrendingSection from '@/components/TrendingSection';
import HotReleasesSection from '@/components/HotReleasesSection';
import AllCoursesSection from '@/components/AllCoursesSection';
import CategoriesSection from '@/components/CategoriesSection';
import { categoryOptions } from '../schemas/courseForm';

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

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    data: onChainCourses, 
    isLoading: isLoadingOnChain,
    isError: isReadError,
  } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: 'getAllCourses', 
  }) as { data?: OnChainCourse[], isLoading: boolean, isError: boolean };

  useEffect(() => {
    const fetchMetadataAndSetState = async () => {
      if (isLoadingOnChain) {
        return; 
      }
    
      // Xử lý lỗi đọc contract
      if (isReadError) {
        console.error('❌ Lỗi đọc getAllCourses:', isReadError);
        addToast({
          title: 'Lỗi Blockchain',
          description: 'Không thể tải danh sách khóa học (getAllCourses).',
          color: 'danger',
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
                metadata = { ...data, rating: data.rating || 4.5 };
              }
            } catch (err) {
              console.warn(`⚠️ Lỗi tải metadata từ IPFS (${course.contentCid}):`, err);
            }
            
            return { ...course, metadata };
          })
        );

        setCourses(fetchedCourses.filter(Boolean) as Course[]);
      } catch (err) {
        console.error('❌ Lỗi fetch metadata:', err);
        setCourses(onChainCourses);
        addToast({
          title: 'Lỗi',
          description: 'Không thể tải metadata từ IPFS.',
          color: 'danger',
        });
      } finally {
        setLoading(false); 
      }
    };

    fetchMetadataAndSetState();
  
  }, [onChainCourses, isLoadingOnChain, isReadError]); 

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        {/* Cập nhật text loading */}
        <p className="text-lg font-medium">Đang tải khóa học từ blockchain & IPFS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MainTitle />
      
      {courses.length > 0 ? (
        <>
          <TrendingSection courses={courses} />
          <HotReleasesSection courses={courses.slice(-4).reverse()} /> 
          <AllCoursesSection courses={courses} />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">
            Chưa có khóa học nào được tạo. Hãy tạo khóa học đầu tiên!
          </p>
        </div>
      )}

      <CategoriesSection categories={categoryOptions} />
    </div>
  );
};

export default Home;
