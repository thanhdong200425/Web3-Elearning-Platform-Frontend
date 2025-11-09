import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button } from "@heroui/button";

import Header from "@/components/Header";
import { Course } from "@/services/aiService";

interface Lesson {
  id: string;
  title: string;
  duration?: string;
  type?: "lesson" | "quiz" | "case-study";
  overview?: string;
  content?: string;
  keyConcepts?: Array<{ title: string; description: string }>;
}

interface Module {
  id: string;
  number: number;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

const AIResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state?.courseData as Course | undefined;

  // Transform course data into modules format
  const initialModules: Module[] = courseData
    ? courseData.modules.map((module, index) => ({
      id: module.id,
      number: index + 1,
      title: module.title,
      lessons: module.lessons,
      isExpanded: index === 0, // Expand first module by default
    }))
    : [
      {
        id: "module-1",
        number: 1,
        title: "Foundations and Core Concepts",
        isExpanded: true,
        lessons: [
          {
            id: "lesson-1-1",
            title: "Introduction to the Topic",
            duration: "12 min",
          },
          {
            id: "lesson-1-2",
            title: "Key Terminology and Definitions",
            duration: "8 min",
          },
          {
            id: "lesson-1-3",
            title: "Historical Context",
            duration: "10 min",
          },
          {
            id: "lesson-1-4",
            title: "Knowledge Check",
            duration: "5 min",
            type: "quiz",
          },
        ],
      },
    ];

  const [modules, setModules] = useState<Module[]>(initialModules);
  const [selectedLesson, setSelectedLesson] = useState<string>(
    initialModules[0]?.lessons[0]?.id || "lesson-1-1",
  );

  // Update modules when courseData changes
  useEffect(() => {
    if (courseData) {
      const transformedModules = courseData.modules.map((module, index) => ({
        id: module.id,
        number: index + 1,
        title: module.title,
        lessons: module.lessons,
        isExpanded: index === 0,
      }));
      setModules(transformedModules);
      if (transformedModules[0]?.lessons[0]?.id) {
        setSelectedLesson(transformedModules[0].lessons[0].id);
      }
    }
  }, [courseData]);

  const toggleModule = (moduleId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m,
      ),
    );
  };

  const selectedLessonData = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === selectedLesson);

  // Get lesson content from the lesson data structure
  const selectedLessonContent = selectedLessonData as Lesson & {
    overview?: string;
    content?: string;
    keyConcepts?: Array<{ title: string; description: string }>;
  };

  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progress = 8; // 8% progress

  const courseTitle = courseData?.courseTitle || "Smart Contract Security";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col">
          {/* Course Info Section */}
          <div className="border-b border-slate-200 p-6">
            <button
              onClick={() => navigate("/ai-tutor")}
              className="flex items-center gap-2 text-[#45556c] text-sm mb-6 hover:text-[#0f172b] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Generator
            </button>

            <h2 className="text-base font-normal leading-6 text-[#0f172b] mb-4">
              {courseTitle}
            </h2>

            <div className="flex items-center gap-2 text-sm text-[#45556c] mb-4">
              <span>{totalModules} modules</span>
              <span>•</span>
              <span>{totalLessons} lessons</span>
            </div>

            {/* Progress Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#45556c]">Progress</span>
                <span className="text-[#0f172b] font-normal">{progress}%</span>
              </div>
              <div className="h-2 bg-[rgba(3,2,19,0.2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#030213] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto">
            {modules.map((module) => (
              <div key={module.id} className="border-b border-slate-200">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#62748e]">
                      {module.number}
                    </span>
                    <span className="text-sm font-normal text-[#0f172b]">
                      {module.title}
                    </span>
                  </div>
                  {module.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#62748e]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#62748e]" />
                  )}
                </button>

                {module.isExpanded && module.lessons.length > 0 && (
                  <div className="pb-2">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === selectedLesson;
                      const isCompleted = false; // You can add completion logic here

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson.id)}
                          className={`w-full pl-12 pr-6 py-4 flex items-center gap-3 text-left transition-colors ${isActive ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#62748e]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm mb-1 ${isActive
                                  ? "text-[#0f172b] font-medium"
                                  : "text-[#314158]"
                                }`}
                            >
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[#62748e]">
                              {lesson.duration && (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.duration}</span>
                                </>
                              )}
                              {lesson.type && (
                                <>
                                  {lesson.duration && <span>•</span>}
                                  <span className="capitalize">
                                    {lesson.type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Lesson Header */}
            <div className="bg-white rounded-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-[#45556c] mb-3">
                    <span>
                      {selectedLessonData
                        ? `Lesson ${modules.flatMap((m) => m.lessons).findIndex((l) => l.id === selectedLesson) + 1}`
                        : "Lesson 1"}
                    </span>
                    {selectedLessonData?.duration && (
                      <>
                        <span>•</span>
                        <span>{selectedLessonData.duration}</span>
                      </>
                    )}
                    {selectedLessonData?.type && (
                      <>
                        <span>•</span>
                        <span className="capitalize">
                          {selectedLessonData.type}
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="text-base font-normal leading-6 text-[#0f172b] mb-4">
                    {selectedLessonData?.title || "Loading..."}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="bordered"
                    size="sm"
                    className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg h-8 px-3 text-sm text-neutral-950"
                    startContent={<Share2 className="w-4 h-4" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant="bordered"
                    size="sm"
                    className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg h-8 px-3 text-sm text-neutral-950"
                    startContent={<Download className="w-4 h-4" />}
                  >
                    Export
                  </Button>
                </div>
              </div>

              <div className="h-px bg-[rgba(0,0,0,0.1)]" />
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg p-8 space-y-8">
              {selectedLessonContent && selectedLessonData ? (
                <>
                  {/* Overview Section */}
                  {selectedLessonContent.overview && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-normal leading-[30px] text-[#0f172b]">
                        Overview
                      </h2>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-base font-normal leading-[26px] text-[#314158] whitespace-pre-wrap">
                          {selectedLessonContent.overview}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lesson Content Section */}
                  {selectedLessonContent.content && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-normal leading-[30px] text-[#0f172b]">
                        Lesson Content
                      </h2>
                      <div className="prose prose-sm max-w-none">
                        <div className="text-base font-normal leading-[26px] text-[#314158] whitespace-pre-wrap">
                          {selectedLessonContent.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Concepts Section */}
                  {selectedLessonContent.keyConcepts &&
                    selectedLessonContent.keyConcepts.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-normal leading-[30px] text-[#0f172b]">
                          Key Concepts
                        </h2>
                        <div className="space-y-4">
                          {selectedLessonContent.keyConcepts.map(
                            (concept, index) => (
                              <div
                                key={index}
                                className="bg-slate-50 border border-slate-200 rounded-[10px] p-5 space-y-2 hover:border-slate-300 transition-colors"
                              >
                                <h3 className="text-lg font-medium leading-6 text-[#0f172b]">
                                  {concept.title}
                                </h3>
                                <p className="text-sm font-normal leading-6 text-[#314158]">
                                  {concept.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <div className="text-center py-12 text-[#45556c]">
                  {courseData
                    ? "Select a lesson to view its content"
                    : "No course data available. Please generate a course first."}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="bordered"
                size="sm"
                className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg h-9 px-4 text-sm text-neutral-950 opacity-50"
                startContent={<ChevronLeft className="w-4 h-4" />}
                isDisabled
              >
                Previous Lesson
              </Button>
              <Button
                size="sm"
                className="bg-[#0f172b] rounded-lg h-9 px-4 text-sm text-white"
                endContent={<ChevronRightIcon className="w-4 h-4" />}
              >
                Next Lesson
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResult;
