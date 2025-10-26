import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  courseFormSchema,
  CourseFormData,
  categoryOptions,
} from '../schemas/courseForm';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import FileUpload from '../components/FileUpload';
import StepIndicator from '../components/StepIndicator';
import Web3Configuration from '../components/Web3Configuration';
import CourseContent from '../components/CourseContent';
import CoursePreview from '../components/CoursePreview';


const AddCourse: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const totalSteps = 4;

  const steps = [
    {
      number: 1,
      title: 'Basic Information',
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      number: 2,
      title: 'Web3 & Pricing Configuration',
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
    {
      number: 3,
      title: 'Course Content & IPFS Upload',
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
    },
    {
      number: 4,
      title: 'Preview & Publish (Deploy)',
      isActive: currentStep === 4,
      isCompleted: false,
    },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      detailedDescription: '',
      category: '',
      coverImage: undefined,
      paymentToken: 'USDC',
      coursePrice: 0,
      walletAddress: '',
      sections: [],
    },
  });

  const coursePrice = watch('coursePrice') || 0;

  const onSubmit = async (data: CourseFormData) => {
    try {
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await handleSubmit(onSubmit)();
      // Here you would typically handle the blockchain deployment
      console.log('Course deployed successfully!');
    } catch (error) {
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={steps}
        />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white border border-gray-200 rounded-[14px] h-[907px] p-8">
            <div className="flex flex-col gap-6 h-full">
              {/* Step Content */}
              {currentStep === 1 && (
                <>
                  {/* Header */}
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-medium text-neutral-950">
                      Course Information
                    </h1>
                    <p className="text-base text-gray-600">
                      Provide basic information about your course
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="flex flex-col gap-4 flex-1">
                    {/* Course Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-950">
                        Course Title
                      </label>
                      <Input
                        {...register('title')}
                        placeholder="Enter course title (max 80 chars)"
                        maxLength={80}
                        isInvalid={!!errors.title}
                        errorMessage={errors.title?.message}
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper: "bg-gray-100 border-0 rounded-lg px-3 py-2",
                        }}
                      />
                    </div>

                    {/* Short Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-950">
                        Short Description
                      </label>
                      <Textarea
                        label=""
                        placeholder="Enter a brief description (max 250 chars)"
                        {...register('shortDescription')}
                        isInvalid={!!errors.shortDescription}
                        errorMessage={errors.shortDescription?.message}
                        rows={3}
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper: "bg-gray-100 border-0 rounded-lg px-3 py-2",
                        }}
                      />
                    </div>

                    {/* Detailed Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-950">
                        Detailed Description
                      </label>
                      <Textarea
                        label=""
                        placeholder="Provide detailed course information and objectives"
                        {...register('detailedDescription')}
                        isInvalid={!!errors.detailedDescription}
                        errorMessage={errors.detailedDescription?.message}
                        rows={3}
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper: "bg-gray-100 border-0 rounded-lg px-3 py-2",
                        }}
                      />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-950">
                        Category
                      </label>
                      <Select
                        {...register('category')}
                        placeholder="Select category"
                        isInvalid={!!errors.category}
                        errorMessage={errors.category?.message}
                        classNames={{
                          trigger: "bg-gray-100 border-0 rounded-lg px-3 py-2",
                        }}
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
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <Web3Configuration
                  register={register}
                  errors={errors}
                  coursePrice={coursePrice}
                />
              )}

              {currentStep === 3 && (
                <CourseContent
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 4 && (
                <CoursePreview
                  watch={watch}
                  onDeploy={handleDeploy}
                  isDeploying={isDeploying}
                />
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <Button
                      variant="bordered"
                      size="md"
                      onPress={handleBack}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50"
                      disabled={currentStep === 1}
                    >
                      Back
                    </Button>
                    <Button
                      variant="solid"
                      size="md"
                      onPress={handleNextStep}
                      disabled={isSubmitting}
                      className="bg-gray-900 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Next Step'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Back Button for Step 4 */}
              {currentStep === 4 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-start">
                    <Button
                      variant="bordered"
                      size="md"
                      onPress={handleBack}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
