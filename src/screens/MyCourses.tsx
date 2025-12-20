import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import { addToast } from "@heroui/toast";
import Header from "@/components/layout/Header";
import { Button } from "@heroui/button";
import { formatEther } from "viem";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

interface Course {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
  metadata?: {
    description?: string;
    imageCid?: string;
    category?: string;
    rating?: number;
    shortDescription?: string;
    contentCid?: string;
  };
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [loadingPurchased, setLoadingPurchased] = useState(true);
  const [loadingCreated, setLoadingCreated] = useState(true);

  // Purchased course IDs
  const { data: purchasedCourseIds } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getPurchasedCourses",
    args: [address || "0x0"],
    query: {
      enabled: !!address && isConnected,
    },
  }) as { data?: bigint[] };

  // All courses (to filter by instructor)
  const { data: allCourses } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getAllCourse",
    args: [],
    query: {
      enabled: isConnected,
    },
  }) as { data?: any[] };

  const myCreatedCourseIds = useMemo(() => {
    if (!allCourses || !address) return [];
    const lower = address.toLowerCase();
    return allCourses
      .filter((c: any) => {
        const instructor = (c?.instructor ?? c?.[1] ?? "").toLowerCase();
        return instructor === lower;
      })
      .map((c: any) => (c?.id ?? c?.[0]) as bigint);
  }, [allCourses, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoadingPurchased(false);
      setLoadingCreated(false);
      return;
    }

    // Load Purchased
    if (purchasedCourseIds && purchasedCourseIds.length > 0) {
      fetchCoursesByIds(purchasedCourseIds, setPurchasedCourses, setLoadingPurchased);
    } else {
      setLoadingPurchased(false);
      setPurchasedCourses([]);
    }

    // Load Created
    if (myCreatedCourseIds.length > 0) {
      fetchCoursesByIds(myCreatedCourseIds, setCreatedCourses, setLoadingCreated);
    } else {
      setLoadingCreated(false);
      setCreatedCourses([]);
    }
  }, [purchasedCourseIds, myCreatedCourseIds, isConnected, address, publicClient]);

  const fetchCoursesByIds = async (
    courseIds: bigint[],
    setTarget: React.Dispatch<React.SetStateAction<Course[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
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
          functionName: "courses",
          args: [courseId],
        })
      );

      const courseData = await Promise.all(coursePromises);

      const fetchedCourses = await Promise.all(
        courseData.map(async (course: any) => {
          const [id, instructor, price, title, contentCid] = course;
          let metadata: any = undefined;

          // contentCid is metadataCid in your FE
          try {
            // Try direct JSON (metadataCid)
            const res1 = await fetch(`${IPFS_GATEWAY}${contentCid}`);
            if (res1.ok) {
              metadata = await res1.json();
            } else {
              // fallback folder style
              const url = `${IPFS_GATEWAY}${contentCid}/metadata.json`;
              const res2 = await fetch(url);
              if (res2.ok) metadata = await res2.json();
            }
          } catch (err) {
            console.warn(`Error fetching metadata for course ${id}:`, err);
          }

          return { id, instructor, price, title, contentCid, metadata };
        })
      );

      // dedupe by id (in case overlap)
      const uniq = new Map<string, Course>();
      for (const c of fetchedCourses) {
        uniq.set(c.id.toString(), c);
      }

      setTarget(Array.from(uniq.values()));
    } catch (err) {
      console.error("Error fetching courses:", err);
      addToast({
        title: "Error",
        description: "Cannot load courses.",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const CourseCard = ({
    course,
    showEdit,
  }: {
    course: Course;
    showEdit?: boolean;
  }) => {
    const imageUrl = course.metadata?.imageCid
      ? `${IPFS_GATEWAY}${course.metadata.imageCid}`
      : "https://via.placeholder.com/300x200";

    const priceInEth = formatEther(course.price);

    return (
      <div
        key={Number(course.id)}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <img src={imageUrl} alt={course.title} className="w-full h-48 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Instructor: {course.instructor.substring(0, 6)}...
            {course.instructor.substring(course.instructor.length - 4)}
          </p>

          {course.metadata?.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">
              {course.metadata.category}
            </span>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold text-blue-600">{priceInEth} ETH</span>

            <div className="flex gap-2">
              {showEdit && (
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-gray-300"
                  onPress={() => navigate(`/course/${course.id.toString()}/edit`)}
                >
                  Edit
                </Button>
              )}

              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onPress={() => navigate(`/course/${course.id}/view`)}
              >
                View Course
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              Please connect your wallet to view your courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPurchased && loadingCreated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading your courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

        {/* ===== Created Courses (Instructor) ===== */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              My Created Courses
            </h2>
            <Button
              className="bg-gray-900 text-white"
              onPress={() => navigate("/add-course")}
            >
              Create New Course
            </Button>
          </div>

          {loadingCreated ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-600">Loading created courses...</p>
            </div>
          ) : createdCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-600">
                You haven't created any courses yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdCourses.map((course) => (
                <CourseCard key={course.id.toString()} course={course} showEdit />
              ))}
            </div>
          )}
        </div>

        {/* ===== Purchased Courses (Existing behavior kept) ===== */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Purchased Courses
          </h2>

          {loadingPurchased ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-600">Loading purchased courses...</p>
            </div>
          ) : purchasedCourses.length === 0 ? (
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
                You haven't purchased any courses yet
              </h2>
              <p className="text-gray-600 mb-6">Explore and buy your first course!</p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onPress={() => navigate("/")}
              >
                Explore Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCourses.map((course) => (
                <CourseCard key={course.id.toString()} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
