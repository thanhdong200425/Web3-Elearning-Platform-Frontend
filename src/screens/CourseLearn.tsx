import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  X,
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  FileText,
  CheckCircle,
  Play,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useCourseData } from "@/hooks/useCourseData";
import { CourseLesson, calculateCourseStats } from "@/types/courseTypes";

interface ExtendedLesson extends CourseLesson {
  sectionIndex: number;
  lessonIndex: number;
}

const CourseLearn: React.FC = () => {
  const navigate = useNavigate();
  const { courseId: id } = useParams<{ courseId: string }>();
  const { isConnected } = useAccount();

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
    hasPurchased,
    isCheckingPurchase,
    isInstructor,
  } = useCourseData(courseId);

  // Calculate stats
  const { totalLessons } = calculateCourseStats(courseContent);

  // Flatten lessons for navigation
  const allLessons = useMemo(() => {
    if (!courseContent?.sections) return [];
    const lessons: ExtendedLesson[] = [];
    courseContent.sections.forEach((section, sectionIndex) => {
      section.lessons?.forEach((lesson, lessonIndex) => {
        lessons.push({
          ...lesson,
          sectionIndex,
          lessonIndex,
        });
      });
    });
    return lessons;
  }, [courseContent]);

  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  const currentLesson = allLessons[currentLessonIndex];

  const handleExitCourse = () => {
    navigate(`/course/${id}`);
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonClick = (lessonGlobalIndex: number) => {
    setCurrentLessonIndex(lessonGlobalIndex);
  };

  const handleMarkComplete = () => {
    setCompletedLessons((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentLessonIndex);
      return newSet;
    });
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-3 h-3" />;
      case "text":
        return <FileText className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === allLessons.length - 1;

  // Check purchase access and redirect if needed
  useEffect(() => {
    // Wait for all checks to complete
    if (isLoading || isLoadingContent || isCheckingPurchase) return;

    // If not connected, redirect to course detail
    if (!isConnected) {
      navigate(`/course/${id}`);
      return;
    }

    // If not purchased and not instructor, redirect to course detail
    if (!hasPurchased && !isInstructor && courseData) {
      navigate(`/course/${id}`);
    }
  }, [isLoading, isLoadingContent, isCheckingPurchase, isConnected, hasPurchased, isInstructor, navigate, id, courseData]);

  // Loading state
  if (isLoading || isLoadingContent || isCheckingPurchase) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading course from blockchain & IPFS...</p>
      </div>
    );
  }

  // Access denied state
  if (!isConnected || (!hasPurchased && !isInstructor)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Lock className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-gray-600 text-lg mb-2">Course Access Restricted</p>
        <p className="text-gray-500 text-sm mb-4">
          {!isConnected ? "Please connect your wallet to access this course" : "Please purchase this course to access the content"}
        </p>
        <Button onPress={() => navigate(`/course/${id}`)} className="bg-blue-600 text-white">
          {!isConnected ? "Back to Course" : "Purchase Course"}
        </Button>
      </div>
    );
  }

  // Error state
  if (isError || !courseData || !courseContent || allLessons.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-600 text-lg mb-4">Course not found or has no content</p>
        <Button onPress={() => navigate(`/course/${id}`)} className="bg-blue-600 text-white">
          Back to Course
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 h-[76px] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExitCourse}
            className="w-9 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <h1 className="text-[#0a0a0a] text-base font-normal">
              {courseMetadata?.title || courseData.title}
            </h1>
            <p className="text-[#6a7282] text-sm">
              {completedLessons.size} of {totalLessons} lessons completed
            </p>
          </div>
        </div>
        <Button
          onPress={handleExitCourse}
          className="bg-white border border-gray-200 text-[#0a0a0a] rounded-lg h-9 px-4 text-sm"
        >
          Exit Course
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Course Content */}
        <div className="w-80 bg-[#f9fafb] border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <h2 className="text-[#0a0a0a] text-base font-normal mb-1">
              Course Content
            </h2>
            <p className="text-[#6a7282] text-sm">
              {courseContent.sections?.length || 0} sections
            </p>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {courseContent.sections?.map((section, sectionIndex) => {
              let lessonGlobalIndex = 0;
              // Calculate the starting global index for this section
              for (let i = 0; i < sectionIndex; i++) {
                lessonGlobalIndex += courseContent.sections?.[i]?.lessons?.length || 0;
              }

              return (
                <Card
                  key={sectionIndex}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-0"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(sectionIndex)}
                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-gray-700 transition-transform ${
                        expandedSections.includes(sectionIndex) ? "rotate-90" : ""
                      }`}
                    />
                    <span className="text-[#0a0a0a] text-sm flex-1 text-left">
                      {section.title}
                    </span>
                  </button>

                  {/* Lessons List */}
                  {expandedSections.includes(sectionIndex) && (
                    <div className="border-t border-gray-200">
                      {section.lessons?.map((lesson, lessonIndex) => {
                        const currentGlobalIndex = lessonGlobalIndex + lessonIndex;
                        return (
                          <button
                            key={lessonIndex}
                            onClick={() => handleLessonClick(currentGlobalIndex)}
                            className={`w-full px-4 py-3 pl-12 flex flex-col gap-1 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                              currentLessonIndex === currentGlobalIndex ? "bg-[#eff6ff]" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson.type)}
                              <span
                                className={`text-sm flex-1 text-left ${
                                  currentLessonIndex === currentGlobalIndex
                                    ? "text-[#155dfc]"
                                    : "text-[#364153]"
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[960px] mx-auto px-20 py-8">
              {/* Lesson Header */}
              <div className="mb-8">
                <div className="inline-block border border-gray-200 px-2 py-1 rounded-lg mb-3">
                  <span className="text-[#0a0a0a] text-xs capitalize">
                    {currentLesson?.type || "text"}
                  </span>
                </div>
                <h1 className="text-[#0a0a0a] text-base font-normal mb-2">
                  {currentLesson?.title}
                </h1>
              </div>

              <div className="border-t border-gray-200 mb-8"></div>

              {/* Lesson Content Based on Type */}
              {currentLesson?.type === "video" && (
                <div className="bg-[#101828] rounded-lg h-[540px] flex items-center justify-center mb-8">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-[#99a1af] text-base">
                      Video content will be loaded from IPFS
                    </p>
                  </div>
                </div>
              )}

              {currentLesson?.type === "text" && (
                <Card className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
                  <p className="text-[#364153] text-base leading-relaxed whitespace-pre-wrap">
                    {currentLesson.content || "Lesson content will be displayed here."}
                  </p>
                </Card>
              )}

              {/* Mark as Complete Button */}
              <div className="flex justify-center">
                <Button
                  onPress={handleMarkComplete}
                  className="bg-[#030213] text-white rounded-lg h-10 px-6 text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Complete
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t border-gray-200 px-14 py-6">
            <div className="flex items-center justify-between">
              <Button
                onPress={handlePreviousLesson}
                disabled={isFirstLesson}
                className="bg-white border border-gray-200 text-[#0a0a0a] rounded-lg h-9 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </Button>
              <p className="text-[#6a7282] text-sm">
                Lesson {currentLessonIndex + 1} of {totalLessons}
              </p>
              <Button
                onPress={handleNextLesson}
                disabled={isLastLesson}
                className="bg-[#030213] text-white rounded-lg h-9 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                Next Lesson
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;

