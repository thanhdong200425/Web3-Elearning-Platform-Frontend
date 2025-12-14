import React from "react";
import { Button } from "@heroui/button";
import CourseCard from "../cards/CourseCard";

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

const AllCoursesSection: React.FC<{ courses: Course[] }> = ({ courses }) => {
  return (
    <section className="bg-white py-8 px-8 rounded-xl shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-black">
            All Available Courses
          </h2>
          <Button variant="bordered" color="primary" size="md">
            View all courses
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={Number(course.id)} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllCoursesSection;
