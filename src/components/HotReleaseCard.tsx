import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    : 'https://via.placeholder.com/400x250';

  const rating = course.metadata?.rating || 4.5;

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
    </div>
  );
};

export default HotReleaseCard;