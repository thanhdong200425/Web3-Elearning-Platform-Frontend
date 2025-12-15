import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plus, Brain, User } from "lucide-react";
import { useAccount } from "wagmi";
import ConnectWalletButton from "./buttons/ConnectWalletButton";

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
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="#030213"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#030213"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="#030213"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
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
            className={`h-9 px-3 rounded-lg flex items-center gap-2 ${isCoursesPage
              ? "bg-[#030213] text-white"
              : "text-neutral-950 hover:bg-gray-50"
              }`}
            to="/"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-normal">Courses</span>
          </Link>
          {isConnected && (
            <>
              <Link
                className="h-9 px-3 rounded-lg flex items-center gap-2 text-neutral-950 hover:bg-gray-50"
                to="/add-course"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-normal">Create Course</span>
              </Link>
              <Link
                className={`h-9 px-3 rounded-lg flex items-center gap-2 ${location.pathname === "/ai-tutor"
                  ? "bg-[#030213] text-white"
                  : "text-neutral-950 hover:bg-gray-50"
                  }`}
                to="/ai-tutor"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-normal">AI Tutor</span>
              </Link>
              <Link
                className="h-9 px-3 rounded-lg flex items-center gap-2 text-neutral-950 hover:bg-gray-50"
                to="/profile"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-normal">Profile</span>
              </Link>
            </>
          )}

          {/* Connect Wallet Button */}
          <div className="ml-2 pl-2 border-l border-slate-200">
            <ConnectWalletButton />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
