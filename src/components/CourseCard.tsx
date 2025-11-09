import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatEther } from 'viem';

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
    : 'https://via.placeholder.com/300x200';

  const rating = course.metadata?.rating || 4.5;
  const priceInEth = formatEther(course.price);

  const handleClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div
      className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={course.title}
        className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 truncate">
          {course.instructor}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-current"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.638-.921 1.94 0l1.247 3.834a1 1 0 00.95.691h4.041c.969 0 1.371 1.243.588 1.81l-3.26 2.373a1 1 0 00-.364 1.118l1.247 3.834c.3.921-.755 1.688-1.54 1.118l-3.26-2.373a1 1 0 00-1.175 0l-3.26 2.373c-.784.57-1.84-.197-1.54-1.118l1.247-3.834a1 1 0 00-.364-1.118L2.055 9.262c-.783-.567-.381-1.81.588-1.81h4.04a1 1 0 00.95-.691l1.247-3.834z" />
            </svg>
            <span className="text-sm font-medium text-gray-800">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm font-bold text-blue-600">
            {priceInEth} ETH
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;