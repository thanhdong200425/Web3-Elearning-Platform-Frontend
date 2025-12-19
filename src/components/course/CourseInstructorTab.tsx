import React from "react";
import { OnChainCourse } from "@/types/courseTypes";

interface CourseInstructorTabProps {
    courseData: OnChainCourse;
}

const CourseInstructorTab: React.FC<CourseInstructorTabProps> = ({ courseData }) => {
    return (
        <div>
            <h2 className="text-[#0a0a0a] text-xl mb-4">About the Instructor</h2>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {courseData.instructor.slice(2, 4).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-gray-900 font-medium mb-1">Wallet Address</h3>
                    <p className="text-gray-500 text-sm font-mono mb-2">
                        {courseData.instructor}
                    </p>
                    <p className="text-gray-600 text-sm">
                        This course was created and deployed by the instructor at the
                        address above. All course content is stored on IPFS and verified
                        on the blockchain.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CourseInstructorTab;
