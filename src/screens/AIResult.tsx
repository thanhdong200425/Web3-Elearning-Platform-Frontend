import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronDown,
    ChevronRight,
    Clock,
    CheckCircle2,
    Circle,
    Share2,
    Download,
    ChevronLeft,
    ChevronRight as ChevronRightIcon
} from "lucide-react";
import { Button } from "@heroui/button";

import Header from "@/components/Header";

interface Lesson {
    id: string;
    title: string;
    duration: string;
    type?: "lesson" | "quiz" | "case-study";
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
    const [selectedLesson, setSelectedLesson] = useState<string>("lesson-1-1");
    const [modules, setModules] = useState<Module[]>([
        {
            id: "module-1",
            number: 1,
            title: "Foundations and Core Concepts",
            isExpanded: true,
            lessons: [
                { id: "lesson-1-1", title: "Introduction to the Topic", duration: "12 min" },
                { id: "lesson-1-2", title: "Key Terminology and Definitions", duration: "8 min" },
                { id: "lesson-1-3", title: "Historical Context", duration: "10 min" },
                { id: "lesson-1-4", title: "Knowledge Check", duration: "5 min", type: "quiz" },
            ],
        },
        {
            id: "module-2",
            number: 2,
            title: "Practical Applications",
            isExpanded: true,
            lessons: [
                { id: "lesson-2-1", title: "Real-World Use Cases", duration: "15 min" },
                { id: "lesson-2-2", title: "Implementation Strategies", duration: "20 min" },
                { id: "lesson-2-3", title: "Case Study Analysis", duration: "18 min", type: "case-study" },
                { id: "lesson-2-4", title: "Best Practices", duration: "12 min" },
            ],
        },
        {
            id: "module-3",
            number: 3,
            title: "Advanced Topics",
            isExpanded: false,
            lessons: [],
        },
    ]);

    const toggleModule = (moduleId: string) => {
        setModules(modules.map(m =>
            m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
        ));
    };

    const selectedLessonData = modules
        .flatMap(m => m.lessons)
        .find(l => l.id === selectedLesson);

    const totalModules = modules.length;
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const progress = 8; // 8% progress

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
                            Smart Contract Security
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
                                        <span className="text-sm text-[#62748e]">{module.number}</span>
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
                                                        <p className={`text-sm mb-1 ${isActive ? "text-[#0f172b] font-medium" : "text-[#314158]"
                                                            }`}>
                                                            {lesson.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-[#62748e]">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{lesson.duration}</span>
                                                            {lesson.type && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="capitalize">{lesson.type}</span>
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
                                        <span>Lesson 1</span>
                                        <span>•</span>
                                        <span>15 min</span>
                                    </div>
                                    <h1 className="text-base font-normal leading-6 text-[#0f172b] mb-4">
                                        {selectedLessonData?.title || "Real-World Use Cases"}
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
                        <div className="bg-white rounded-lg p-8 space-y-6">
                            {/* Overview Section */}
                            <div className="space-y-3">
                                <h2 className="text-xl font-normal leading-[30px] text-[#0f172b]">
                                    Overview
                                </h2>
                                <p className="text-base font-normal leading-[26px] text-[#314158]">
                                    This lesson provides a comprehensive introduction to the topic, exploring its fundamental concepts and significance. You'll learn about the key principles that form the foundation of this subject area and understand why it matters in today's context.
                                </p>
                            </div>

                            {/* Key Concepts Section */}
                            <div className="space-y-3">
                                <h2 className="text-base font-normal leading-6 text-[#0f172b]">
                                    Key Concepts
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-white border border-slate-200 rounded-[10px] p-[17px] space-y-2">
                                        <h3 className="text-base font-normal leading-6 text-[#0f172b]">
                                            Understanding the Basics
                                        </h3>
                                        <p className="text-sm font-normal leading-5 text-[#314158]">
                                            The foundation of this topic lies in understanding how different components interact and influence each other. This involves recognizing patterns, identifying relationships, and comprehending the underlying mechanisms.
                                        </p>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-[10px] p-[17px] space-y-2">
                                        <h3 className="text-base font-normal leading-6 text-[#0f172b]">
                                            Core Principles
                                        </h3>
                                        <p className="text-sm font-normal leading-5 text-[#314158]">
                                            Several fundamental principles guide the application of these concepts. These principles provide a framework for decision-making and problem-solving in practical scenarios.
                                        </p>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-[10px] p-[17px] space-y-2">
                                        <h3 className="text-base font-normal leading-6 text-[#0f172b]">
                                            Practical Implications
                                        </h3>
                                        <p className="text-sm font-normal leading-5 text-[#314158]">
                                            Understanding these concepts has direct implications for real-world applications. You'll be able to apply this knowledge to analyze situations, make informed decisions, and develop effective solutions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Objectives Section */}
                            <div className="space-y-3">
                                <h2 className="text-base font-normal leading-6 text-[#0f172b]">
                                    Learning Objectives
                                </h2>
                                <ul className="space-y-2">
                                    {[
                                        "Understand the fundamental concepts and terminology",
                                        "Identify key principles and their applications",
                                        "Recognize patterns and relationships within the subject area",
                                        "Apply knowledge to practical scenarios and case studies",
                                    ].map((objective) => (
                                        <li key={objective} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-[#314158] mt-0.5 flex-shrink-0" />
                                            <span className="text-base font-normal leading-6 text-[#314158]">
                                                {objective}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
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

