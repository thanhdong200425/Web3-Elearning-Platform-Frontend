import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { OnChainCourse, CourseMetadata, CourseContent } from "@/types/courseTypes";

interface CourseOverviewTabProps {
    courseData: OnChainCourse;
    courseMetadata: CourseMetadata | null;
    courseContent: CourseContent | null;
    contentError: string | null;
}

const CourseOverviewTab: React.FC<CourseOverviewTabProps> = ({
    courseData,
    courseMetadata,
    courseContent,
    contentError,
}) => {
    return (
        <div className="space-y-8">
            {/* About this course */}
            <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">About this course</h2>
                <p className="text-[#4a5565] text-base leading-relaxed">
                    {courseMetadata?.description ||
                        `This course "${courseData.title}" is stored on the blockchain and IPFS, ensuring permanent access and ownership verification.`}
                </p>
            </div>

            {/* What you'll learn */}
            <div>
                <h2 className="text-[#0a0a0a] text-base mb-4">What you'll learn</h2>
                <div className="grid grid-cols-2 gap-3">
                    {courseContent?.sections?.slice(0, 6).map((section, index) => (
                        <div key={index} className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <p className="text-[#364153] text-base">{section.title}</p>
                        </div>
                    ))}
                    {(!courseContent?.sections || courseContent.sections.length === 0) && (
                        <>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-[#364153] text-base">Comprehensive course content</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-[#364153] text-base">Blockchain verified certificate</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Requirements */}
            <div>
                <h2 className="text-[#0a0a0a] text-base mb-4">Requirements</h2>
                <ul className="space-y-2">
                    <li className="flex gap-3 text-[#4a5565] text-base">
                        <span className="text-[#99a1af]">•</span>
                        <span>MetaMask wallet installed</span>
                    </li>
                    <li className="flex gap-3 text-[#4a5565] text-base">
                        <span className="text-[#99a1af]">•</span>
                        <span>Basic understanding of blockchain</span>
                    </li>
                    <li className="flex gap-3 text-[#4a5565] text-base">
                        <span className="text-[#99a1af]">•</span>
                        <span>A computer with internet connection</span>
                    </li>
                </ul>
            </div>

            {/* Content Error Warning */}
            {contentError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <p className="text-yellow-800 text-sm">{contentError}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseOverviewTab;
