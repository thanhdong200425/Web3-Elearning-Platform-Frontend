import React from "react";
import { ArrowRight } from "lucide-react";
import HotReleaseCard from "../cards/HotReleaseCard";

interface Course {
  id: bigint;
  instructor: string;
  price: bigint;
  title: string;
  contentCid: string;
  metadata?: {
    description: string;
    imageCid: string;
    category: string;
    rating: number;
  };
}

const HotReleasesSection: React.FC<{ courses: Course[] }> = ({ courses }) => {
  return (
    <section className="bg-gradient-to-r from-[#155dfc] to-[#2b7fff] py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-normal leading-[30px] text-white">
              Hot new releases
            </h2>
            <p className="text-base font-normal leading-6 text-blue-100">
              Discover the latest courses from top partners
            </p>
          </div>

          <button className="bg-[#eceef2] h-9 px-3 rounded-lg flex items-center gap-2 text-[#030213] hover:bg-gray-200 transition-colors">
            <span className="text-sm font-normal">Explore courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {courses.map((course) => (
            <HotReleaseCard key={Number(course.id)} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotReleasesSection;
