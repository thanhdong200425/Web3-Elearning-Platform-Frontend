import React from "react";
import CourseCard from "../cards/CourseCard";
import { ChevronRight } from "lucide-react";

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

const TrendingSection: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const mostPopular = [...courses]
    .sort((a, b) => (b.metadata?.rating || 0) - (a.metadata?.rating || 0))
    .slice(0, 3);

  const weeklySpotlight = courses.slice(3, 6);
  const aiSkills = courses
    .filter(
      (c) =>
        c.metadata?.category === "data-science" || c.metadata?.category === "ai"
    )
    .slice(0, 3);

  const renderCourseColumn = (title: string, courseList: Course[]) => (
    <div className="bg-gray-50 rounded-[10px] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-normal leading-5 text-neutral-950">
          {title}
        </h3>
        <button
          className="w-4 h-4 text-neutral-950 hover:opacity-70 transition-opacity"
          aria-label={`View all ${title}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {courseList.length > 0 ? (
          courseList.map((course) => (
            <CourseCard key={Number(course.id)} course={course} />
          ))
        ) : (
          <p className="text-xs text-[#4a5565] italic py-4">
            No courses found in this category
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="bg-white py-10 px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h2 className="text-base font-normal leading-6 text-neutral-950">
          Trending courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCourseColumn("Most popular", mostPopular)}
          {renderCourseColumn("Weekly spotlight", weeklySpotlight)}
          {renderCourseColumn("In-demand AI skills", aiSkills)}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
