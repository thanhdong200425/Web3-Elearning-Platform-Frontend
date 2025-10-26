import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  courseFormSchema,
  CourseFormData,
  categoryOptions,
} from '../schemas/courseForm';
import { Input } from '@heroui/input';
import { Progress } from '@heroui/progress';
import { Textarea } from '@heroui/input';
import {Button} from "@heroui/button";
import {Select, SelectItem} from "@heroui/select";
import FileUpload from '../components/FileUpload';


const AddCourse: React.FC = () => {
  const [currentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      detailedDescription: '',
      category: '',
      coverImage: undefined,
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    try {
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleNextStep = () => {
    handleSubmit(onSubmit)();
  };

  const handleBack = () => {
    console.log('Back clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-1 px-6 py-5 h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white p-4">
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-base text-[#121417]">
              Course Setup
            </h2>

            {/* Progress Bar */}
            <Progress
              aria-label="Loading..."
              className="max-w-md"
              value={25}
              classNames={{
                indicator: 'bg-black',
              }}
            />

            <p className="font-normal text-sm text-[#61758a]">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-[960px]">
          {/* Header */}
          <div className="p-4">
            <h1 className="font-bold text-[32px] text-[#121417]">
              Course Information
            </h1>
          </div>

          {/* Course Title */}
          <div className="px-4 py-3">
            <Input
              {...register('title')}
              placeholder="Enter course title (max 80 chars)"
              maxLength={80}
              label="Course Title"
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
            />
          </div>

          {/* Short Description */}
          <div className="px-4 py-3">
            <Textarea
              label="Short Description"
              placeholder="Enter a brief description of the course"
              {...register('shortDescription')}
              isInvalid={!!errors.shortDescription}
              errorMessage={errors.shortDescription?.message}
              rows={3}
            />
          </div>

          {/* Detailed Description */}
          <div className="px-4 py-3">
            <Textarea
              {...register('detailedDescription')}
              placeholder="Enter a detailed description of the course content"
              isInvalid={!!errors.detailedDescription}
              errorMessage={errors.detailedDescription?.message}
              rows={6}
            />
          </div>

          {/* Category */}
          <div className="px-4 py-3">
            <Select
              {...register('category')}
              label="Category"
              placeholder="Select category"
              isInvalid={!!errors.category}
              errorMessage={errors.category?.message}
            >
              {categoryOptions.map((option) => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* File Upload */}
          <FileUpload
            setValue={setValue}
            name="coverImage"
            error={errors.coverImage}
            accept="image/*"
          />

          {/* Navigation Buttons */}
          <div className="px-4 py-3">
            <div className="flex justify-end gap-3">
              <Button
                variant="bordered"
                size="md"
                onPress={handleBack}
                className="bg-[#f0f2f5] h-10 w-[84px] rounded-xl text-[#121417] hover:bg-[#e5e7eb]"
              >
                Back
              </Button>
              <Button
                variant="solid"
                size="md"
                onPress={handleNextStep}
                disabled={isSubmitting}
                className="bg-[#1280ed] h-10 rounded-xl text-white hover:bg-[#0f6bc7] disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Next Step'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
