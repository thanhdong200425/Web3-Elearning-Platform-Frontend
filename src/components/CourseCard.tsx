import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatEther } from 'viem';
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

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate = useNavigate();
  const imageUrl = course.metadata?.imageCid
    ? `${IPFS_GATEWAY}${course.metadata.imageCid}`
    : 'https://via.placeholder.com/80x80';

  const rating = course.metadata?.rating || 4.5;
  const priceInEth = formatEther(course.price);

  const category = course.metadata?.category || 'General';
  const categoryLabel = 
    category === 'data-science' ? 'Specialization' : 
    category === 'blockchain' ? 'Professional Certificate' : 
    'Professional Certificate';

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-[10px] flex gap-3 p-[13px] cursor-pointer hover:shadow-md transition-all duration-300"
    >
      <div className="bg-gray-100 rounded-[4px] w-20 h-20 shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-xs font-normal leading-4 text-[#4a5565] mb-1">
            {course.instructor}
          </p>
          <h4 className="text-sm font-normal leading-5 text-neutral-950 mb-2 line-clamp-2">
            {course.title}
          </h4>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-normal leading-4 text-[#4a5565]">
              {categoryLabel}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#4a5565] text-[#4a5565]" />
              <span className="text-xs font-normal leading-4 text-[#4a5565]">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">
            {priceInEth} ETH
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;