import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { addToast } from "@heroui/toast";

import FileUpload from "../components/FileUpload";
import StepIndicator from "../components/StepIndicator";
import Web3Configuration from "../components/Web3Configuration";
import CourseContent from "../components/CourseContent";
import CoursePreview from "../components/CoursePreview";
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
import BackButton from '@/components/buttons/BackButton';
import { useWriteContract, useAccount } from 'wagmi';
import { elearningPlatformABI, elearningPlatformAddress } from '@/contracts/ElearningPlatform';
import { parseEther } from 'viem';
import { addToast } from '@heroui/toast';
import { uploadCourseContent, uploadCourseImage, uploadCourseMetadata } from '@/services/ipfs';
} from "../schemas/courseForm";

import BackButton from "@/components/buttons/BackButton";
import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";

const AddCourse: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const steps = useMemo(() => {
    return [
      {
        number: 1,
        title: "Basic Information",
        isActive: currentStep === 1,
        isCompleted: currentStep > 1,
      },
      {
        number: 2,
        title: "Web3 & Pricing Configuration",
        isActive: currentStep === 2,
        isCompleted: currentStep > 2,
      },
      {
        number: 3,
        title: "Course Content & IPFS Upload",
        isActive: currentStep === 3,
        isCompleted: currentStep > 3,
      },
      {
        number: 4,
        title: "Preview & Publish (Deploy)",
        isActive: currentStep === 4,
        isCompleted: false,
      },
    ];
  }, [currentStep]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      detailedDescription: "",
      category: "",
      coverImage: undefined,
      paymentToken: "USDC",
      coursePrice: 0,
      walletAddress: "",
      sections: [],
    },
  });

  const { data: hash, writeContract, isPending, isSuccess, error: writeError } = useWriteContract();
  const { isConnected } = useAccount();
  const {
    data: hash,
    writeContract,
    isPending,
    isSuccess,
  } = useWriteContract();

  const defaultLabelClassNames = useMemo(() => {
    return "text-sm font-medium text-neutral-950";
  }, []);

  const coursePrice = watch("coursePrice") || 0;

  // Handle write errors
  React.useEffect(() => {
    if (writeError) {
      console.error('Deployment failed:', writeError);
      addToast({
        title: "Error",
        description: writeError.message || 'Failed to deploy course. Please check your wallet connection and try again.',
        color: 'danger',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  }, [writeError]);

  // Handle success
  React.useEffect(() => {
    if (isSuccess && hash) {
      addToast({
        title: "Success",
        description: `Course deployed successfully! Transaction hash: ${hash.substring(0, 10)}...`,
        color: 'success',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  }, [isSuccess, hash]);

  const onSubmit = async (data: CourseFormData) => {
    // Check if wallet is connected
    if (!isConnected) {
      addToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before deploying the course.",
        color: 'danger',
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    // Validate required fields
    if (!data.title || !data.coursePrice || data.coursePrice <= 0) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields including course title and price.",
        color: 'danger',
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    // Validate course content
    if (!data.sections || data.sections.length === 0) {
      addToast({
        title: "Validation Error",
        description: "Please add at least one section with lessons before deploying.",
        color: 'danger',
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    try {
      // Step 1: Upload course content to IPFS
      addToast({
        title: "Uploading to IPFS",
        description: "Đang upload nội dung khóa học lên IPFS...",
        color: 'default',
        timeout: 10000,
        shouldShowTimeoutProgress: true,
      });

      console.log('📤 Starting IPFS upload process...');
      console.log('📋 Course data:', {
        title: data.title,
        sectionsCount: data.sections?.length || 0,
        hasImage: !!data.coverImage,
      });

      // Step 1: Upload cover image first if provided (so we can include it in content.json)
      let imageCid: string | undefined;
      if (data.coverImage) {
        try {
          addToast({
            title: "Uploading Image",
            description: "Đang upload hình ảnh khóa học...",
            color: 'default',
            timeout: 5000,
            shouldShowTimeoutProgress: true,
          });
          imageCid = await uploadCourseImage(data.coverImage);
          console.log('✅ Course image uploaded. CID:', imageCid);
        } catch (imageError) {
          console.warn('⚠️ Failed to upload image, continuing without image:', imageError);
          // Continue without image if upload fails
        }
      }

      // Step 2: Upload course content (sections and lessons) with imageCid included
      const contentCid = await uploadCourseContent(data.sections || [], imageCid);
      console.log('✅ Course content uploaded. CID:', contentCid);

      // Step 3: Upload metadata (optional, for better organization)
      let metadataCid: string | undefined;
      try {
        const metadata = {
          title: data.title,
          description: data.detailedDescription || data.shortDescription,
          shortDescription: data.shortDescription,
          imageCid: imageCid,
          category: data.category,
          rating: 0, // Default rating
        };
        metadataCid = await uploadCourseMetadata(metadata);
        console.log('✅ Course metadata uploaded. CID:', metadataCid);
      } catch (metadataError) {
        console.warn('⚠️ Failed to upload metadata, continuing with content CID only:', metadataError);
        // Continue with content CID only
      }

      // Step 4: Deploy to smart contract with real CID
      addToast({
        title: "Deploying to Blockchain",
        description: "Đang deploy khóa học lên blockchain...",
        color: 'default',
        timeout: 30000,
        shouldShowTimeoutProgress: true,
      });

      // Use contentCid as the main CID for the course
      // This is what will be used to fetch course content
      writeContract({
        address: elearningPlatformAddress,
        abi: elearningPlatformABI,
        functionName: "createCourse",
        args: [
          data.title,
          parseEther(data.coursePrice.toString()),
          contentCid  // ✅ Sử dụng CID thực tế từ IPFS upload
        ]
      });

      console.log('✅ Course deployment initiated with CID:', contentCid);
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        color: 'danger',
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
          "bafybeigdyrzt5sfp7udh766prysmz3lksqjvh56bn32lbcehtfgs2xs7iy6yv4oibutq6aieaq36f",
        ],
      });
    } catch (error) {
      console.error("Deployment failed:", error);
      addToast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      throw new Error(error as string);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      addToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet in Step 2 before deploying.",
        color: 'danger',
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }
    handleSubmit(onSubmit)();
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
          steps={steps}
          totalSteps={totalSteps}
        />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="bg-white border border-gray-200 rounded-[14px] p-8">
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
                      <Input
                        {...register("title")}
                        isRequired
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper:
                            "bg-gray-100 border-0 rounded-lg px-3 py-2",
                          label: defaultLabelClassNames,
                        }}
                        errorMessage={errors.title?.message}
                        isInvalid={!!errors.title}
                        label="Course Title"
                        labelPlacement="outside-top"
                        maxLength={80}
                        placeholder="Enter course title (max 80 chars)"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="flex flex-col gap-1.5">
                      <Textarea
                        isRequired
                        label="Short Description"
                        labelPlacement="outside-top"
                        placeholder="Enter a brief description (max 250 chars)"
                        {...register("shortDescription")}
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper:
                            "bg-gray-100 border-0 rounded-lg px-3 py-2",
                          label: defaultLabelClassNames,
                        }}
                        errorMessage={errors.shortDescription?.message}
                        isInvalid={!!errors.shortDescription}
                        rows={3}
                      />
                    </div>

                    {/* Detailed Description */}
                    <div className="flex flex-col gap-1.5">
                      <Textarea
                        label="Detailed Description"
                        placeholder="Provide detailed course information and objectives"
                        {...register("detailedDescription")}
                        classNames={{
                          input: "bg-gray-100 border-0 rounded-lg",
                          inputWrapper:
                            "bg-gray-100 border-0 rounded-lg px-3 py-2",
                          label: defaultLabelClassNames,
                        }}
                        errorMessage={errors.detailedDescription?.message}
                        isInvalid={!!errors.detailedDescription}
                        labelPlacement="outside-top"
                        rows={3}
                      />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <Select
                        isRequired
                        label="Category"
                        placeholder="Select category"
                        {...register("category")}
                        classNames={{
                          trigger: "bg-gray-100 border-0 rounded-lg px-3 py-2",
                          label: defaultLabelClassNames,
                        }}
                        errorMessage={errors.category?.message}
                        isInvalid={!!errors.category}
                        labelPlacement="outside"
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
                      accept="image/*"
                      error={errors.coverImage}
                      isRequired={false}
                      name="coverImage"
                      setValue={setValue}
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <Web3Configuration
                  coursePrice={coursePrice}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                />
              )}

              {currentStep === 3 && (
                <CourseContent setValue={setValue} watch={watch} />
              )}

              {currentStep === 4 && (
                <CoursePreview
                  isDeploying={isPending}
                  watch={watch}
                  onDeploy={handleDeploy}
                />
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <Button
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50"
                      disabled={currentStep === 1}
                      size="md"
                      variant="bordered"
                      onPress={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      className="bg-gray-900 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      disabled={isSubmitting}
                      size="md"
                      variant="solid"
                      onPress={handleNextStep}
                    >
                      {isSubmitting ? "Processing..." : "Next Step"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Back Button for Step 4 */}
              {currentStep === 4 && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-start">
                    <BackButton onBack={handleBack} />
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
