import React, { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useReadContract } from 'wagmi';
import { addToast } from '@heroui/toast';
import { elearningPlatformABI, elearningPlatformAddress } from '@/contracts/ElearningPlatform';
import Header from '@/components/Header';
import PartnerLogosSection from '@/components/PartnerLogosSection';
import TrendingSection from '@/components/TrendingSection';
import HotReleasesSection from '@/components/HotReleasesSection';
import AllCoursesSection from '@/components/AllCoursesSection';
import CategoriesSection from '@/components/CategoriesSection';
import { categoryOptions } from '../schemas/courseForm';


interface Course {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
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
  const publicClient = usePublicClient();

  const { data: nextCourseId, isError: isReadError } = useReadContract({
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
            const url = `${IPFS_GATEWAY}${contentCid}/metadata.json`; 
            const res = await fetch(url);
            
            if (res.ok) {
              metadata = { ...await res.json(), rating: (await res.json()).rating || 4.5 }; 
            }
          } catch (err) {
            console.warn(`⚠️ Lỗi tải metadata từ IPFS (${contentCid}):`, err);
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

  useEffect(() => {
    if (nextCourseId && nextCourseId > 1n) {
      fetchCourses(Number(nextCourseId) - 1);
    } else {
      setLoading(false);
    }

    if (isReadError) {
        addToast({
            title: 'Lỗi Blockchain',
            description: 'Không thể đọc số lượng khóa học (nextCourseId). Kiểm tra kết nối mạng.',
            color: 'danger',
        });
        setLoading(false);
    }
  }, [nextCourseId, isReadError, fetchCourses]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium">Đang tải khóa học từ blockchain...</p>
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
            Chưa có khóa học nào được tạo. Hãy tạo khóa học đầu tiên!
          </p>
        </div>
      )}

      <CategoriesSection categories={categoryOptions} />
    </div>
  );
};

export default Home;