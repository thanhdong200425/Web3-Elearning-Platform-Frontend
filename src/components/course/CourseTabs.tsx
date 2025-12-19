import React from "react";
import { TabType } from "@/types/courseTypes";

interface CourseTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const CourseTabs: React.FC<CourseTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs: { key: TabType; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "curriculum", label: "Curriculum" },
        { key: "instructor", label: "Instructor" },
    ];

    return (
        <div className="border-b border-gray-200 mb-8">
            <div className="flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${activeTab === tab.key
                                ? "border-[#101828] text-[#0a0a0a]"
                                : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CourseTabs;
