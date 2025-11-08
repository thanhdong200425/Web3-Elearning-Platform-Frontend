import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Brain, User } from "lucide-react";
import { useAccount } from "wagmi";

const Header: React.FC = () => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const isCoursesPage = location.pathname === "/";

  return (
    <header className="bg-white border-b border-slate-200 h-[65px] flex items-center px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="#030213"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#030213"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="#030213"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-normal leading-6 text-[#0f172b]">
              Web3 Learning Platform
            </h1>
            <p className="text-xs font-normal leading-4 text-[#62748e]">
              Courses verified by Blockchain and stored on IPFS
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`h-9 px-3 rounded-lg flex items-center gap-2 ${isCoursesPage
                ? "bg-[#030213] text-white"
                : "text-neutral-950 hover:bg-gray-50"
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-normal">Courses</span>
          </Link>
          {isConnected && (
            <>
              <Link
                to="/add-course"
                className="h-9 px-3 rounded-lg flex items-center gap-2 text-neutral-950 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-normal">Create Course</span>
              </Link>
              <button className="h-9 px-3 rounded-lg flex items-center gap-2 text-neutral-950 hover:bg-gray-50">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-normal">AI Tutor</span>
              </button>
              <button className="h-9 px-3 rounded-lg flex items-center gap-2 text-neutral-950 hover:bg-gray-50">
                <User className="w-4 h-4" />
                <span className="text-sm font-normal">Profile</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
