import React from 'react';
import { Button } from '@heroui/button';
import { ArrowRight } from 'lucide-react';
import HotReleaseCard from './HotReleaseCard';

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
    <section className="bg-blue-700 py-16 px-4 md:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-1">🔥 Hot New Releases</h2>
            <p className="text-lg opacity-80">
              Discover the latest courses from top partners
            </p>
          </div>

          <Button className="text-white border-white hover:border-white focus:border-white active:border-white- flex items-center gap-2"
            variant="ghost"
            size="md"
          >
            View all courses
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <HotReleaseCard key={Number(course.id)} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotReleasesSection;
