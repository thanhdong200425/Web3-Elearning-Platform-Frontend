import React, { useState, useEffect } from "react";
import { useReadContract, useChainId } from "wagmi";
import { addToast } from "@heroui/toast";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";
import Header from "@/components/layout/Header";
import PartnerLogosSection from "@/components/sections/PartnerLogosSection";
import TrendingSection from "@/components/sections/TrendingSection";
import HotReleasesSection from "@/components/sections/HotReleasesSection";
import AllCoursesSection from "@/components/sections/AllCoursesSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import { categoryOptions } from "../schemas/courseForm";
import { getContentFromIPFS } from "@/services/ipfs";

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
  const chainId = useChainId();

  // Read all courses from contract
  const {
    data: onChainCourses,
    isLoading: isLoadingOnChain,
    isError: isReadError,
    error: readError,
  } = useReadContract({
    address: elearningPlatformAddress,
    abi: elearningPlatformABI,
    functionName: "getAllCourse",
  }) as {
    data?: OnChainCourse[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };

  useEffect(() => {
    const fetchMetadataAndSetState = async () => {
      if (isLoadingOnChain) {
        return;
      }

      // Handle contract read error
      if (isReadError) {
        const errorDescription = readError
          ? readError.message.split("\n")[0] // Get first line of error message
          : "Unknown error loading from Blockchain.";

        console.error("❌ Error reading getAllCourse:", readError);
        console.log("🔍 Current chain:", "Chain ID:", chainId);
        console.log("📍 Contract address:", elearningPlatformAddress);

        addToast({
          title: "Blockchain Error",
          description:
            chainId === 31337
              ? `Cannot load course list: ${errorDescription}`
              : `⚠️ Wrong network! Please switch to Localhost (Chain ID: 31337). Current: Chain ID: ${chainId || "Unknown"}`,
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
              // BUG: wrong url
              const res = await getContentFromIPFS(course.contentCid);
              metadata = res;
            } catch (err) {
              console.warn(
                `⚠️ Error loading metadata from IPFS (${course.contentCid}):`,
                err
              );
            }

            return { ...course, metadata };
          })
        );

        console.log("Fetched courses:", fetchedCourses);

        // TypeScript guard: filter out non-Course items (if logic error)
        setCourses(fetchedCourses.filter(Boolean) as Course[]);
      } catch (err) {
        console.error("❌ Error fetching metadata:", err);
        // If metadata fetch fails, still show on-chain courses if available
        setCourses(onChainCourses.map((c) => ({ ...c, metadata: undefined })));
        addToast({
          title: "Error",
          description:
            "Cannot load metadata from IPFS. Displayed data might be incomplete.",
          color: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetadataAndSetState();
  }, [onChainCourses, isLoadingOnChain, isReadError, readError, chainId]); // Add chain to dependency array

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium">
          Loading courses from blockchain & IPFS...
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
            {/* Show appropriate message on error */}
            {isReadError ? (
              <>
                Cannot load data. Please check your **network connection** and
                **contract address**.
              </>
            ) : (
              <>No courses created yet. Be the first to create one!</>
            )}
          </p>
        </div>
      )}

      <CategoriesSection categories={categoryOptions} />
    </div>
  );
};

export default Home;
