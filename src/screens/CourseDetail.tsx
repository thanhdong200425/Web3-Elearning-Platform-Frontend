import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import { useCourseData } from "@/hooks/useCourseData";
import { TabType, buildImageUrl, calculateCourseStats } from "@/types/courseTypes";

// Course Detail Components
import CourseDetailHeader from "@/components/course/CourseDetailHeader";
import CourseEnrollmentCard from "@/components/course/CourseEnrollmentCard";
import CourseTabs from "@/components/course/CourseTabs";
import CourseOverviewTab from "@/components/course/CourseOverviewTab";
import CourseCurriculumTab from "@/components/course/CourseCurriculumTab";
import CourseInstructorTab from "@/components/course/CourseInstructorTab";
import CourseSidebar from "@/components/course/CourseSidebar";

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courseId: id } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Parse course ID from URL
  const courseId = id ? BigInt(id) : undefined;

  // Fetch course data using custom hook
  const {
    courseData,
    courseContent,
    courseMetadata,
    isLoading,
    isLoadingContent,
    isError,
    contentError,
  } = useCourseData(courseId);

  // Calculate stats
  const { totalLessons, totalSections } = calculateCourseStats(courseContent);

  // Build image URL
  const imageUrl = buildImageUrl(courseMetadata, courseContent);

  // Handlers
  const handleBack = () => navigate("/");
  const handleEnroll = () => {
    if (courseData) {
      navigate(`/course/${courseData.id.toString()}/learn`);
    }
  };

  // Loading state
  if (isLoading || (isLoadingContent && !courseData)) {
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

  // Error state
  if (isError || !courseData || courseData.id === 0n) {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header Section */}
      <CourseDetailHeader
        courseData={courseData}
        courseMetadata={courseMetadata}
        totalLessons={totalLessons}
        totalSections={totalSections}
        onBack={handleBack}
      />

      {/* Enrollment Card */}
      <CourseEnrollmentCard
        courseData={courseData}
        imageUrl={imageUrl}
        onEnroll={handleEnroll}
      />

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-8 pt-8 pb-16">
        <div className="flex gap-8">
          {/* Left Content - Tabs */}
          <div className="flex-1 max-w-[800px]">
            <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "overview" && (
              <CourseOverviewTab
                courseData={courseData}
                courseMetadata={courseMetadata}
                courseContent={courseContent}
                contentError={contentError}
              />
            )}

            {activeTab === "curriculum" && (
              <CourseCurriculumTab
                courseContent={courseContent}
                isLoading={isLoadingContent}
              />
            )}

            {activeTab === "instructor" && (
              <CourseInstructorTab courseData={courseData} />
            )}
          </div>

          {/* Right Sidebar */}
          <CourseSidebar
            courseData={courseData}
            totalLessons={totalLessons}
            totalSections={totalSections}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
