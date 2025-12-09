import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { elearningPlatformABI, elearningPlatformAddress } from '@/contracts/ElearningPlatform';
import { addToast } from '@heroui/toast';
import Header from '@/components/Header';
import { Button } from '@heroui/button';
import { formatEther } from 'viem';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

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

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Get purchased course IDs
  const { data: purchasedCourseIds } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: 'getPurchasedCourses',
    args: [address || '0x0'],
    query: {
      enabled: !!address && isConnected,
    },
  }) as { data?: bigint[] };

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    if (purchasedCourseIds && purchasedCourseIds.length > 0) {
      fetchPurchasedCourses(purchasedCourseIds);
    } else {
      setLoading(false);
    }
  }, [purchasedCourseIds, isConnected, address, publicClient]);

  const fetchPurchasedCourses = async (courseIds: bigint[]) => {
    if (!publicClient) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const coursePromises = courseIds.map((courseId) =>
        publicClient.readContract({
          address: elearningPlatformAddress,
          abi: elearningPlatformABI,
          functionName: 'courses',
          args: [courseId],
        })
      );

      const courseData = await Promise.all(coursePromises);

      const fetchedCourses = await Promise.all(
        courseData.map(async (course: any, index) => {
          const [id, instructor, price, title, contentCid] = course;
          let metadata = undefined;

          try {
            const url = `${IPFS_GATEWAY}${contentCid}/metadata.json`;
            const res = await fetch(url);

            if (res.ok) {
              metadata = await res.json();
            }
          } catch (err) {
            console.warn(`Error fetching metadata for course ${id}:`, err);
          }

          return { id, instructor, price, title, contentCid, metadata };
        })
      );

      setCourses(fetchedCourses);
    } catch (err) {
      console.error('Error fetching purchased courses:', err);
      addToast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khóa học đã mua.',
        color: 'danger',
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Vui lòng kết nối ví để xem các khóa học đã mua.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">Đang tải khóa học của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Khóa học của tôi</h1>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mb-4">
              <svg
                className="w-24 h-24 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bạn chưa mua khóa học nào
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy khám phá và mua khóa học đầu tiên của bạn!
            </p>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onPress={() => navigate('/')}
            >
              Khám phá khóa học
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const imageUrl = course.metadata?.imageCid
                ? `${IPFS_GATEWAY}${course.metadata.imageCid}`
                : 'https://via.placeholder.com/300x200';
              const priceInEth = formatEther(course.price);

              return (
                <div
                  key={Number(course.id)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Giảng viên: {course.instructor.substring(0, 6)}...
                      {course.instructor.substring(course.instructor.length - 4)}
                    </p>
                    {course.metadata?.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">
                        {course.metadata.category}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold text-blue-600">
                        {priceInEth} ETH
                      </span>
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onPress={() => navigate(`/course/${course.id}/view`)}
                      >
                        Xem khóa học
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

