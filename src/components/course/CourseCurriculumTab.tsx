import React from "react";
import { PlayCircle, FileText, Loader2 } from "lucide-react";
import { CourseContent } from "@/types/courseTypes";

interface CourseCurriculumTabProps {
    courseContent: CourseContent | null;
    isLoading: boolean;
}

const CourseCurriculumTab: React.FC<CourseCurriculumTabProps> = ({
    courseContent,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading curriculum...</span>
            </div>
        );
    }

    if (!courseContent?.sections || courseContent.sections.length === 0) {
        return (
            <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">Course Curriculum</h2>
                <p className="text-[#4a5565] text-base">
                    Curriculum content will be available after enrollment.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-[#0a0a0a] text-xl mb-4">Course Curriculum</h2>
            <div className="space-y-4">
                {courseContent.sections.map((section, sectionIndex) => (
                    <div
                        key={sectionIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                                Section {sectionIndex + 1}: {section.title}
                            </h3>
                            <span className="text-sm text-gray-500">
                                {section.lessons?.length || 0} lessons
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {section.lessons?.map((lesson, lessonIndex) => (
                                <div
                                    key={lessonIndex}
                                    className="px-4 py-3 flex items-center gap-3"
                                >
                                    {lesson.type === "video" ? (
                                        <PlayCircle className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-gray-700 text-sm">{lesson.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseCurriculumTab;
