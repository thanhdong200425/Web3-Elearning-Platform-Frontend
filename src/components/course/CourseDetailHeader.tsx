import React from "react";
import { Star, Users, Clock, Globe, Database } from "lucide-react";
import { OnChainCourse, CourseMetadata } from "@/types/courseTypes";

interface CourseDetailHeaderProps {
    courseData: OnChainCourse;
    courseMetadata: CourseMetadata | null;
    totalLessons: number;
    totalSections: number;
    onBack: () => void;
}

const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({
    courseData,
    courseMetadata,
    totalLessons,
    totalSections,
    onBack,
}) => {
    return (
        <div className="bg-[#101828] relative">
            <div className="max-w-[1280px] mx-auto px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="text-[#d1d5dc] text-sm mb-6 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                >
                    ← Back to Courses
                </button>

                <div className="flex gap-8">
                    <div className="flex-1 max-w-[800px]">
                        {/* Badge */}
                        <div className="inline-block bg-[#155dfc] text-white text-xs px-2 py-1 rounded-lg mb-4">
                            {courseMetadata?.category || "Blockchain"}
                        </div>

                        {/* Title */}
                        <h1 className="text-white text-2xl font-semibold mb-2">
                            {courseData.title}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-[#d1d5dc] text-base mb-4">
                            {courseMetadata?.shortDescription ||
                                courseMetadata?.description ||
                                "Learn and master this course on the blockchain"}
                        </p>

                        {/* Rating and Students */}
                        <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-white font-bold text-sm">
                                    {courseMetadata?.rating?.toFixed(1) || "4.5"}
                                </span>
                                <span className="text-[#99a1af] text-sm">(New)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-white" />
                                <span className="text-white text-sm">{totalLessons} lessons</span>
                            </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#99a1af]" />
                                <span className="text-[#99a1af] text-sm">{totalSections} sections</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#99a1af]" />
                                <span className="text-[#99a1af] text-sm">English</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-[#99a1af]" />
                                <span className="text-[#99a1af] text-sm">Stored on IPFS</span>
                            </div>
                        </div>

                        {/* Instructor */}
                        <p className="text-[#99a1af] text-xs">
                            Instructor: {courseData.instructor.slice(0, 6)}...
                            {courseData.instructor.slice(-4)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailHeader;
