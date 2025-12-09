import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

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

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const HotReleaseCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();
  const imageUrl = course.metadata?.imageCid
    ? `${IPFS_GATEWAY}${course.metadata.imageCid}`
    : 'https://via.placeholder.com/320x176';

  const rating = course.metadata?.rating || 4.5;
  const instructorName = course.instructor || 'Unknown';
  const firstLetter = instructorName.charAt(0).toUpperCase();

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={course.title}
        className="w-full h-48 object-cover"
      />

      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-xl backdrop-blur-sm">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.title}</h3>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="font-medium text-gray-800">{rating.toFixed(1)}</span>
          <span className="mx-2">·</span>
          <span>1.2K reviews</span>
          <span className="mx-2">·</span>
          <span className="capitalize">{course.metadata?.category || 'General'}</span>
        </p>
      </div>

      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
        aria-label={`View course ${course.title}`}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <span className="font-bold text-lg">→</span>
      </button>
    <div className="bg-white rounded-[10px] overflow-hidden w-[320px] shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-[176px] relative bg-gray-200 overflow-hidden">
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#155dfc] rounded-[6px] w-5 h-5 flex items-center justify-center shrink-0">
            <span className="text-xs font-normal leading-4 text-white">
              {firstLetter}
            </span>
          </div>
          <p className="text-xs font-normal leading-4 text-[#4a5565]">
            {instructorName}
          </p>
        </div>
        
        <h4 className="text-base font-normal leading-6 text-neutral-950 line-clamp-1">
          {course.title}
        </h4>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-neutral-950 text-neutral-950" />
            <span className="text-sm font-normal leading-5 text-neutral-950">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm font-normal leading-5 text-[#6a7282]">
              (12K)
            </span>
          </div>
          <span className="text-sm font-normal leading-5 text-[#99a1af]">•</span>
          <span className="text-sm font-normal leading-5 text-[#4a5565]">
            Beginner
          </span>
        </div>
      </div>
    </div>
  );
};

export default HotReleaseCard;