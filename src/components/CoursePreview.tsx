import React from 'react';
import { UseFormWatch } from 'react-hook-form';
import { CourseFormData } from '../schemas/courseForm';
import { Button } from '@heroui/button';

interface CoursePreviewProps {
  watch: UseFormWatch<CourseFormData>;
  onDeploy: () => void;
  isDeploying: boolean;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({ watch, onDeploy, isDeploying }) => {
  const formData = watch();
  const coursePrice = formData.coursePrice || 0;
  const platformFee = 0.05; // 5%
  const platformFeeAmount = coursePrice * platformFee;
  const revenue = coursePrice - platformFeeAmount;

  const totalSections = formData.sections?.length || 0;
  const totalLessons = formData.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-neutral-950">
          Review & Deploy
        </h1>
        <p className="text-base text-gray-600">
          Review your course details before deploying to the blockchain
        </p>
      </div>

      {/* Warning Alert */}
      <div className="bg-white border border-red-200 rounded-[10px] p-4 flex items-center gap-3">
        <div className="w-4 h-4 flex-shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1L15 14H1L8 1Z"
              stroke="#DC143C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6V9"
              stroke="#DC143C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 11H8.01"
              stroke="#DC143C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm text-red-600">
          This action will submit a transaction to the blockchain. You will need to pay a small gas fee to register your course.
        </p>
      </div>

      {/* Course Overview Card */}
      <div className="bg-white border border-gray-200 rounded-[14px] p-6">
        <h3 className="text-base font-medium text-neutral-950 mb-6">Course Overview</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Course Title</p>
            <p className="text-base text-neutral-950">
              {formData.title || 'Not set'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <div className="inline-block">
              <span className="bg-gray-200 text-gray-900 text-xs px-2 py-1 rounded-lg">
                {formData.category || 'Not set'}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Short Description</p>
            <p className="text-sm text-neutral-950">
              {formData.shortDescription || 'Not set'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Cover Image</p>
            <p className="text-sm text-neutral-950">
              {formData.coverImage ? 'Image uploaded' : 'No image uploaded'}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing & Payment Card */}
      <div className="bg-white border border-gray-200 rounded-[14px] p-6">
        <h3 className="text-base font-medium text-neutral-950 mb-6">Pricing & Payment</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-600">Payment Token</span>
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg">
              {formData.paymentToken || 'USDC'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-600">Course Price</span>
            <span className="text-base text-neutral-950">
              {coursePrice.toFixed(2)} USDC
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-600">Platform Fee</span>
            <span className="text-base text-red-600">5%</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-base font-medium text-neutral-950">
              Your Revenue (per sale)
            </span>
            <span className="text-base font-medium text-green-600">
              {revenue.toFixed(2)} USDC
            </span>
          </div>
        </div>
      </div>

      {/* Course Content Card */}
      <div className="bg-white border border-gray-200 rounded-[14px] p-6">
        <h3 className="text-base font-medium text-neutral-950 mb-6">Course Content</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4H14M2 8H14M2 12H10"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base text-neutral-950 font-medium">
              {totalSections} Sections
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4H14M2 8H14M2 12H10"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base text-neutral-950 font-medium">
              {totalLessons} Lessons
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 1L15 14H1L8 1Z"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6V9"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 11H8.01"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-base text-neutral-950 font-medium">
              0 of {totalLessons} lessons uploaded to IPFS
            </span>
          </div>
        </div>
      </div>

      {/* Deploy Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-[14px] p-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 flex-shrink-0 mt-0.5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 1L19 18H1L10 1Z"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 7V12"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 15H10.01"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-base font-medium text-blue-800 mb-2">
              Ready to Deploy?
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Clicking the button below will trigger a blockchain transaction. Your wallet (e.g., MetaMask) will prompt you to confirm the transaction and pay the gas fee.
            </p>
            
            <Button
              variant="solid"
              size="lg"
              onPress={onDeploy}
              disabled={isDeploying}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 w-full"
            >
              {isDeploying ? 'Deploying...' : 'Deploy & Register Course Smart Contract'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
