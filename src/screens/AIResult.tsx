import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@heroui/button";

import Header from "@/components/layout/Header";
import { CourseContent } from "@/types/courseTypes";

interface ExpandableSection {
  title: string;
  lessons?: Array<{
    title: string;
    content?: string;
    type?: "text" | "video";
  }>;
  isExpanded: boolean;
}

const AIResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state?.courseData as CourseContent | undefined;

  const initialSections: ExpandableSection[] =
    courseData?.sections?.map((section, index) => ({
      ...section,
      isExpanded: index === 0,
    })) || [];

  const [sections, setSections] = useState<ExpandableSection[]>(initialSections);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);

  const toggleSection = (sectionIndex: number) => {
    setSections(
      sections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const allLessons = sections.flatMap((section, sectionIndex) =>
    (section.lessons || []).map((lesson, lessonIndex) => ({
      ...lesson,
      sectionIndex,
      lessonIndex,
      sectionTitle: section.title,
    }))
  );

  const selectedLesson = allLessons[selectedLessonIndex];

  const totalSections = sections.length;
  const totalLessons = allLessons.length;

  if (!courseData || !courseData.sections) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#45556c] mb-4">
              No course data available. Please generate a course first.
            </p>
            <Button
              onPress={() => navigate("/ai-tutor")}
              className="bg-[#0f172b] text-white rounded-lg"
            >
              Back to AI Tutor
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              AI Generated Course
            </h2>

            <div className="flex items-center gap-2 text-sm text-[#45556c]">
              <span>{totalSections} sections</span>
              <span>•</span>
              <span>{totalLessons} lessons</span>
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-b border-slate-200">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#62748e]">
                      {sectionIndex + 1}
                    </span>
                    <span className="text-sm font-normal text-[#0f172b]">
                      {section.title}
                    </span>
                  </div>
                  {section.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#62748e]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#62748e]" />
                  )}
                </button>

                {section.isExpanded && section.lessons && section.lessons.length > 0 && (
                  <div className="pb-2">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const globalLessonIndex = allLessons.findIndex(
                        (l) =>
                          l.sectionIndex === sectionIndex &&
                          l.lessonIndex === lessonIndex
                      );
                      const isActive = globalLessonIndex === selectedLessonIndex;

                      return (
                        <button
                          key={lessonIndex}
                          onClick={() => setSelectedLessonIndex(globalLessonIndex)}
                          className={`w-full pl-12 pr-6 py-3 flex items-center gap-3 text-left transition-colors ${
                            isActive ? "bg-slate-100" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                isActive
                                  ? "text-[#0f172b] font-medium"
                                  : "text-[#314158]"
                              }`}
                            >
                              {lesson.title}
                            </p>
                            {lesson.type && (
                              <p className="text-xs text-[#62748e] capitalize mt-1">
                                {lesson.type}
                              </p>
                            )}
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
                    <span>Lesson {selectedLessonIndex + 1}</span>
                    {selectedLesson?.type && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{selectedLesson.type}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-base font-normal leading-6 text-[#0f172b] mb-2">
                    {selectedLesson?.title || "Loading..."}
                  </h1>
                  <p className="text-sm text-[#62748e]">
                    {selectedLesson?.sectionTitle}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[rgba(0,0,0,0.1)]" />
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg p-8 space-y-8">
              {selectedLesson && selectedLesson.content ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="text-base font-normal leading-[26px] text-[#314158] whitespace-pre-wrap">
                      {selectedLesson.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#45556c]">
                  Select a lesson to view its content
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="bordered"
                size="sm"
                className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg h-9 px-4 text-sm text-neutral-950"
                startContent={<ChevronLeft className="w-4 h-4" />}
                isDisabled={selectedLessonIndex === 0}
                onPress={() => setSelectedLessonIndex(selectedLessonIndex - 1)}
              >
                Previous Lesson
              </Button>
              <Button
                size="sm"
                className="bg-[#0f172b] rounded-lg h-9 px-4 text-sm text-white"
                endContent={<ChevronRight className="w-4 h-4" />}
                isDisabled={selectedLessonIndex === totalLessons - 1}
                onPress={() => setSelectedLessonIndex(selectedLessonIndex + 1)}
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
