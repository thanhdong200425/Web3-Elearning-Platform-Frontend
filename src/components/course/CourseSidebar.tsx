import React from "react";
import { Card } from "@heroui/card";
import { PlayCircle, FileText, Award, Smartphone, Database } from "lucide-react";
import { OnChainCourse } from "@/types/courseTypes";

interface CourseSidebarProps {
    courseData: OnChainCourse;
    totalLessons: number;
    totalSections: number;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
    courseData,
    totalLessons,
    totalSections,
}) => {
    return (
        <div className="w-[384px] space-y-6 mt-[320px]">
            {/* Course Includes Card */}
            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-[#0a0a0a] text-base mb-5">Course includes</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-gray-700" />
                        <span className="text-[#0a0a0a] text-sm">{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-700" />
                        <span className="text-[#0a0a0a] text-sm">{totalSections} sections</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gray-700" />
                        <span className="text-[#0a0a0a] text-sm">Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-700" />
                        <span className="text-[#0a0a0a] text-sm">Access on mobile and desktop</span>
                    </div>
                </div>
            </Card>

            {/* IPFS Storage Card */}
            <Card className="bg-[#f9fafb] border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#155dfc] rounded-lg w-10 h-10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[#4a5565] text-sm">Stored on</p>
                        <p className="text-[#0a0a0a] text-base font-normal">IPFS Network (Pinata)</p>
                    </div>
                </div>
                <p className="text-[#6a7282] text-xs font-mono break-all">
                    {courseData.contentCid}
                </p>
            </Card>
        </div>
    );
};

export default CourseSidebar;
