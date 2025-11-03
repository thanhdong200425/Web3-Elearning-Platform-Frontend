import React from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/button';

const MainTitle: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <section className="bg-white py-12 px-4 md:px-8 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
            Web3 Learning Platform
          </h1>
          <p className="text-base text-gray-600">
            Courses verified by Blockchain and stored on IPFS
          </p>
        </div>

        {isConnected && (
          <Link to="/add-course">
            <Button variant="solid" size="lg" className='bg-black text-white hover:bg-gray-900'>
              + Create New Course
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default MainTitle;
