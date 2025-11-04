import React from 'react';
import CourseCard from './CourseCard';
import { ChevronRight } from 'lucide-react';

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
    .filter((c) => c.metadata?.category === 'data-science')
    .slice(0, 3);

  const renderCourseColumn = (title: string, courseList: Course[], categoryKey?: string) => (
    <div className="bg-gray-50 rounded-xl p-5 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button
          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label={`View all ${title}`} >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {courseList.length > 0 ? (
          courseList.map((course) => (
            <CourseCard key={Number(course.id)} course={course} />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">
            No courses found in this category
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-10">
           Trending Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderCourseColumn('Most Popular', mostPopular)}
          {renderCourseColumn('Weekly Spotlight', weeklySpotlight)}
          {renderCourseColumn('AI/Data Science Skills', aiSkills, 'data-science')}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;