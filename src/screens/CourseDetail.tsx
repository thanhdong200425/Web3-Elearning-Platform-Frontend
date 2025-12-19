import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  Star,
  Users,
  Clock,
  Globe,
  Database,
  PlayCircle,
  FileText,
  Award,
  Smartphone,
  CheckCircle2,
  Copy,
  Infinity,
} from "lucide-react";
import Header from "@/components/layout/Header";

// Mock data for the course
const mockCourse = {
  id: 1,
  title: "Complete Web3 Development Bootcamp",
  description:
    "Master blockchain development from scratch with hands-on projects",
  category: "Blockchain",
  rating: 4.8,
  ratingsCount: 2341,
  studentsCount: 12847,
  price: "2.5",
  duration: "42 hours",
  language: "English",
  lastUpdated: "December 2024",
  imageCid: "QmX7M9CiYXjVw9T2b3tFVc8K4nL9mP6qR5sN8wE3dA1fB2g",
  contractAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  about: `This comprehensive bootcamp takes you from blockchain basics to building full-stack decentralized applications. You'll learn Solidity, smart contract development, Web3.js, React integration, and deploy real projects on Ethereum testnets. Perfect for developers looking to transition into Web3 development with practical, industry-relevant skills.`,
  learnings: [
    "Build and deploy smart contracts on Ethereum",
    "Develop full-stack decentralized applications",
    "Integrate Web3 wallets like MetaMask",
    "Write secure and optimized Solidity code",
    "Understand blockchain architecture and consensus",
    "Test and debug smart contracts effectively",
  ],
  requirements: [
    "Basic understanding of JavaScript",
    "Familiarity with React (helpful but not required)",
    "A computer with internet connection",
    "MetaMask wallet installed",
  ],
  courseIncludes: {
    videoHours: "42 hours on-demand video",
    lessons: "17 lessons",
    certificate: "Certificate of completion",
    access: "Access on mobile and desktop",
  },
  thumbnailUrl:
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
};

type TabType = "overview" | "curriculum" | "instructor";

const CourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const handleBack = () => {
    navigate("/");
  };

  const handleEnroll = () => {
    // Navigate to the learning page
    navigate(`/course/${mockCourse.id}/learn`);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockCourse.contractAddress);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Dark Header Section */}
      <div className="bg-[#101828] relative">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="text-[#d1d5dc] text-sm mb-6 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            ← Back to Courses
          </button>

          <div className="flex gap-8">
            {/* Left Content */}
            <div className="flex-1 max-w-[800px]">
              {/* Badge */}
              <div className="inline-block bg-[#155dfc] text-white text-xs px-2 py-1 rounded-lg mb-4">
                {mockCourse.category}
              </div>

              {/* Title */}
              <h1 className="text-white text-base font-normal mb-2">
                {mockCourse.title}
              </h1>

              {/* Subtitle */}
              <p className="text-[#d1d5dc] text-base mb-4">
                {mockCourse.description}
              </p>

              {/* Rating and Students */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-white font-bold text-sm">
                    {mockCourse.rating}
                  </span>
                  <span className="text-[#99a1af] text-sm">
                    ({mockCourse.ratingsCount} ratings)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">
                    {mockCourse.studentsCount.toLocaleString()} students
                  </span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">
                    {mockCourse.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">
                    {mockCourse.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[#99a1af] text-sm">Stored on IPFS</span>
                </div>
              </div>

              {/* Last Updated */}
              <p className="text-[#99a1af] text-xs">
                Last updated: {mockCourse.lastUpdated}
              </p>
            </div>

            {/* Right Side - Video Preview Card (Positioned absolutely to overlap) */}
          </div>
        </div>
      </div>

      {/* Enrollment Card - Floating */}
      <div className="max-w-[1280px] mx-auto px-8 relative">
        <div className="absolute right-8 -top-[320px] w-[384px]">
          <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Video Preview */}
            <div className="relative bg-gray-200 h-48 flex items-center justify-center overflow-hidden">
              <img
                src={mockCourse.thumbnailUrl}
                alt={mockCourse.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-4 cursor-pointer hover:bg-white transition-colors">
                  <PlayCircle className="w-8 h-8 text-gray-800" />
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[#101828] text-3xl font-bold">
                    {mockCourse.price}
                  </span>
                  <span className="text-[#4a5565] text-xl">ETH</span>
                </div>
                <p className="text-[#6a7282] text-xs">One-time payment</p>
              </div>

              {/* Enroll Button */}
              <Button
                onPress={handleEnroll}
                className="w-full bg-[#030213] text-white rounded-lg h-10 text-sm font-normal mb-8"
              >
                Enroll Now
              </Button>

              {/* Features */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2">
                  <Infinity className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">
                    Lifetime access
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#101828]" />
                  <span className="text-[#101828] text-sm">
                    Blockchain verified
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-6"></div>

              {/* Smart Contract */}
              <div>
                <p className="text-[#4a5565] text-xs mb-1">Smart Contract</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#6a7282] text-xs font-mono flex-1 truncate">
                    {mockCourse.contractAddress}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-8 pt-8 pb-16">
        <div className="flex gap-8">
          {/* Left Content - Tabs */}
          <div className="flex-1 max-w-[800px]">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-[#101828] text-[#0a0a0a]"
                      : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${
                    activeTab === "curriculum"
                      ? "border-[#101828] text-[#0a0a0a]"
                      : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab("instructor")}
                  className={`flex-1 py-2 text-sm text-center border-b-2 transition-colors ${
                    activeTab === "instructor"
                      ? "border-[#101828] text-[#0a0a0a]"
                      : "border-transparent text-[#0a0a0a] hover:border-gray-300"
                  }`}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* Tab Content - Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* About this course */}
                <div>
                  <h2 className="text-[#0a0a0a] text-xl mb-4">
                    About this course
                  </h2>
                  <p className="text-[#4a5565] text-base leading-relaxed">
                    {mockCourse.about}
                  </p>
                </div>

                {/* What you'll learn */}
                <div>
                  <h2 className="text-[#0a0a0a] text-base mb-4">
                    What you'll learn
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {mockCourse.learnings.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-[#364153] text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h2 className="text-[#0a0a0a] text-base mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {mockCourse.requirements.map((item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-[#4a5565] text-base"
                      >
                        <span className="text-[#99a1af]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab Content - Curriculum */}
            {activeTab === "curriculum" && (
              <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">
                  Course Curriculum
                </h2>
                <p className="text-[#4a5565] text-base">
                  Curriculum content will be displayed here...
                </p>
              </div>
            )}

            {/* Tab Content - Instructor */}
            {activeTab === "instructor" && (
              <div>
                <h2 className="text-[#0a0a0a] text-xl mb-4">
                  About the Instructor
                </h2>
                <p className="text-[#4a5565] text-base">
                  Instructor information will be displayed here...
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Course Includes & IPFS Info */}
          <div className="w-[384px] space-y-6 mt-[360px]">
            {/* Course Includes Card */}
            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-[#0a0a0a] text-base mb-5">Course includes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {mockCourse.courseIncludes.videoHours}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {mockCourse.courseIncludes.lessons}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {mockCourse.courseIncludes.certificate}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-700" />
                  <span className="text-[#0a0a0a] text-sm">
                    {mockCourse.courseIncludes.access}
                  </span>
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
                  <p className="text-[#0a0a0a] text-base font-normal">
                    IPFS Network
                  </p>
                </div>
              </div>
              <p className="text-[#6a7282] text-xs font-mono break-all">
                {mockCourse.imageCid}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
