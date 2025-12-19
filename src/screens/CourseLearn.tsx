import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  X,
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  Play,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCourseData } from "@/hooks/useCourseData";
import { CourseLesson, calculateCourseStats } from "@/types/courseTypes";

interface ExtendedLesson extends CourseLesson {
  sectionIndex: number;
  lessonIndex: number;
}

const CourseLearn: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    mockCourseData.sections[0].lessons[0]
  );
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const handleExitCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    }
  };

  const getCurrentLessonNumber = () => {
    let lessonNumber = 0;
    for (const section of mockCourseData.sections) {
      for (const lesson of section.lessons) {
        lessonNumber++;
        if (lesson.id === currentLesson.id) {
          return lessonNumber;
        }
      }
    }
    return 1;
  };

  const handleNextLesson = () => {
    const currentNumber = getCurrentLessonNumber();
    if (currentNumber < mockCourseData.totalLessons) {
      let lessonNumber = 0;
      for (const section of mockCourseData.sections) {
        for (const lesson of section.lessons) {
          lessonNumber++;
          if (lessonNumber === currentNumber + 1) {
            setCurrentLesson(lesson);
            return;
          }
        }
      }
    }
  };

  const handlePreviousLesson = () => {
    const currentNumber = getCurrentLessonNumber();
    if (currentNumber > 1) {
      let lessonNumber = 0;
      for (const section of mockCourseData.sections) {
        for (const lesson of section.lessons) {
          lessonNumber++;
          if (lessonNumber === currentNumber - 1) {
            setCurrentLesson(lesson);
            return;
          }
        }
      }
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-3 h-3" />;
      case "text":
        return <FileText className="w-3 h-3" />;
      case "quiz":
        return <HelpCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const currentLessonNumber = getCurrentLessonNumber();
  const isFirstLesson = currentLessonNumber === 1;
  const isLastLesson = currentLessonNumber === mockCourseData.totalLessons;

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
              {mockCourseData.title}
            </h1>
            <p className="text-[#6a7282] text-sm">
              {completedLessons.length} of {mockCourseData.totalLessons}{" "}
              lessons completed
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
              {mockCourseData.sections.length} sections
            </p>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {mockCourseData.sections.map((section) => (
              <Card
                key={section.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-0"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight
                    className={`w-4 h-4 text-gray-700 transition-transform ${
                      expandedSections.includes(section.id) ? "rotate-90" : ""
                    }`}
                  />
                  <span className="text-[#0a0a0a] text-sm flex-1 text-left">
                    {section.title}
                  </span>
                </button>

                {/* Lessons List */}
                {expandedSections.includes(section.id) && (
                  <div className="border-t border-gray-200">
                    {section.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`w-full px-4 py-3 pl-12 flex flex-col gap-1 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                          currentLesson.id === lesson.id ? "bg-[#eff6ff]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getLessonIcon(lesson.type)}
                          <span
                            className={`text-sm flex-1 text-left ${
                              currentLesson.id === lesson.id
                                ? "text-[#155dfc]"
                                : "text-[#364153]"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-[#6a7282] text-xs text-left">
                          {lesson.duration}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            ))}
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
                    {currentLesson.type}
                  </span>
                </div>
                <h1 className="text-[#0a0a0a] text-base font-normal mb-2">
                  {currentLesson.title}
                </h1>
                <p className="text-[#6a7282] text-base">
                  {currentLesson.duration}
                </p>
              </div>

              <div className="border-t border-gray-200 mb-8"></div>

              {/* Lesson Content Based on Type */}
              {currentLesson.type === "video" && (
                <div className="bg-[#101828] rounded-lg h-[540px] flex items-center justify-center mb-8">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-[#99a1af] text-base">
                      Video content will be loaded from IPFS
                    </p>
                  </div>
                </div>
              )}

              {currentLesson.type === "text" && (
                <Card className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
                  <p className="text-[#364153] text-base leading-relaxed">
                    This lesson introduces you to the fundamental concepts of
                    blockchain technology. You'll learn about distributed
                    ledgers, consensus mechanisms, and how blockchain networks
                    operate. We'll explore real-world use cases and understand
                    why blockchain is revolutionizing various industries.
                    <br />
                    <br />
                    Key topics covered:
                    <br />• What is blockchain technology?
                    <br />• How does a blockchain work?
                    <br />• Types of blockchain networks
                    <br />• Consensus mechanisms explained
                    <br />• Real-world applications
                    <br />
                    <br />
                    By the end of this lesson, you'll have a solid foundation to
                    build upon in the following modules.
                  </p>
                </Card>
              )}

              {currentLesson.type === "quiz" && (
                <Card className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
                  <p className="text-[#364153] text-base text-center">
                    Quiz interface will be displayed here with{" "}
                    {currentLesson.duration}
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
                Lesson {currentLessonNumber} of {mockCourseData.totalLessons}
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

