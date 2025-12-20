import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  courseFormSchema,
  CourseFormData,
  categoryOptions,
} from "../schemas/courseForm";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import FileUpload from "../components/forms/FileUpload";
import StepIndicator from "../components/layout/StepIndicator";
import Web3Configuration from "../components/forms/Web3Configuration";
import CourseContent from "../components/course/CourseContent";
import CoursePreview from "../components/course/CoursePreview";
import BackButton from "@/components/buttons/BackButton";
import { useWriteContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { addToast } from "@heroui/toast";
import { createCourse, updateCourseIPFS } from "@/services/courseService";
import { validateCourseForDeployment } from "@/utils/courseValidation";

import {
  elearningPlatformABI,
  elearningPlatformAddress,
} from "@/contracts/ElearningPlatform";

export type AddCourseMode = "create" | "edit";

type AddCourseProps = {
  mode?: AddCourseMode;
  courseId?: bigint;
  initialValues?: Partial<CourseFormData>;
  existingIpfs?: { imageCid?: string; contentCid?: string };
};

const AddCourse: React.FC<AddCourseProps> = ({
  mode = "create",
  courseId,
  initialValues,
  existingIpfs,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  const isEditMode = mode === "edit";

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
        title: isEditMode ? "Preview & Update (Deploy)" : "Preview & Publish (Deploy)",
        isActive: currentStep === 4,
        isCompleted: false,
      },
    ];
  }, [currentStep, isEditMode]);

  // For edit mode, make coverImage optional at resolver-level.
  // We'll enforce it only if there's no existing imageCid on IPFS.
  const resolverSchema = useMemo(() => {
    if (!isEditMode) return courseFormSchema;
    try {
      // coverImage optional in edit mode
      return (courseFormSchema as any).extend({
        coverImage: z.any().optional(),
      });
    } catch {
      // fallback: use original schema if extend not available
      return courseFormSchema;
    }
  }, [isEditMode]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      detailedDescription: "",
      category: "",
      coverImage: undefined,
      paymentToken: "ETH",
      coursePrice: 0,
      walletAddress: "",
      sections: [],
      ...(initialValues || {}),
    },
  });

  // If initialValues is loaded async (EditCourse page), update form values
  useEffect(() => {
    if (initialValues) {
      reset({
        title: "",
        shortDescription: "",
        detailedDescription: "",
        category: "",
        coverImage: undefined,
        paymentToken: "ETH",
        coursePrice: 0,
        walletAddress: "",
        sections: [],
        ...initialValues,
      });
    }
  }, [initialValues, reset]);

  const {
    data: hash,
    writeContract,
    isPending,
    isSuccess,
    error: writeError,
  } = useWriteContract();

  const { isConnected } = useAccount();

  const defaultLabelClassNames = useMemo(() => {
    return "text-sm font-medium text-neutral-950";
  }, []);

  const coursePrice = watch("coursePrice") || 0;

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error("Deployment failed:", writeError);
      addToast({
        title: "Error",
        description:
          writeError.message ||
          "Failed to deploy course. Please check your wallet connection and try again.",
        color: "danger",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  }, [writeError]);

  // Handle success
  useEffect(() => {
    if (isSuccess && hash) {
      addToast({
        title: "Success",
        description: isEditMode
          ? `Course updated successfully! Tx: ${hash.substring(0, 10)}...`
          : `Course deployed successfully! Tx: ${hash.substring(0, 10)}...`,
        color: "success",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  }, [isSuccess, hash, isEditMode]);

  const toastProgress = (message: string) => {
    addToast({
      title: "Uploading to IPFS",
      description: message,
      color: "default",
      timeout: 2000,
      shouldShowTimeoutProgress: true,
    });
  };

  const onSubmit = async (data: CourseFormData) => {
    // Check wallet
    if (!isConnected) {
      addToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before deploying the course.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    try {
      addToast({
        title: isEditMode ? "Updating Course" : "Creating Course",
        description: isEditMode
          ? "Preparing updated data..."
          : "Preparing data...",
        color: "default",
        timeout: 2000,
        shouldShowTimeoutProgress: true,
      });

      if (!isEditMode) {
        // CREATE FLOW (unchanged)
        const { metadataCid } = await createCourse(data, toastProgress);

        addToast({
          title: "Deploying to Blockchain",
          description: "Deploying course to blockchain...",
          color: "default",
          timeout: 30000,
          shouldShowTimeoutProgress: true,
        });

        writeContract({
          address: elearningPlatformAddress,
          abi: elearningPlatformABI,
          functionName: "createCourse",
          args: [
            data.title,
            parseEther(data.coursePrice.toString()),
            metadataCid as string,
          ],
        });

        return;
      }

      // EDIT FLOW
      if (!courseId) {
        throw new Error("Missing courseId for edit mode.");
      }

      // coverImage optional if existing imageCid exists
      const hasExistingImage = !!existingIpfs?.imageCid;
      if (!data.coverImage && !hasExistingImage) {
        throw new Error("Cover image is required. Please upload cover image.");
      }

      const { metadataCid: newMetadataCid } = await updateCourseIPFS(
        data,
        {
          imageCid: existingIpfs?.imageCid,
          contentCid: existingIpfs?.contentCid,
        },
        toastProgress
      );

      addToast({
        title: "Updating on Blockchain",
        description: "Submitting update transaction...",
        color: "default",
        timeout: 30000,
        shouldShowTimeoutProgress: true,
      });

      writeContract({
        address: elearningPlatformAddress,
        abi: elearningPlatformABI,
        functionName: "updateCourse",
        args: [
          courseId,
          data.title,
          parseEther(data.coursePrice.toString()),
          newMetadataCid,
        ],
      });
    } catch (error: any) {
      console.error("❌ Deploy/Update failed:", error);
      addToast({
        title: "Error",
        description:
          error?.message ||
          "Operation failed. Please check your inputs and try again.",
        color: "danger",
        timeout: 5000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDeploy = async () => {
    // Trigger validation for all fields
    await handleSubmit(
      () => {},
      () => {}
    )();

    const formData = getValues();

    // Create mode uses existing validation util (no changes)
    if (!isEditMode) {
      const validationResult = validateCourseForDeployment(
        formData,
        errors,
        isConnected
      );

      if (!validationResult.isValid) {
        addToast({
          title: validationResult.title || "Validation Error",
          description:
            validationResult.message ||
            "Please fix the errors before deploying.",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });

        if (validationResult.step) {
          setCurrentStep(validationResult.step);
        }
        return;
      }

      handleSubmit(onSubmit)();
      return;
    }

    // Edit mode: relax coverImage requirement if existingIpfs.imageCid exists
    const hasExistingImage = !!existingIpfs?.imageCid;
    const missingCover = !formData.coverImage && !hasExistingImage;

    if (!formData.title || formData.title.trim() === "") {
      addToast({
        title: "Validation Error",
        description: "Course title is required.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(1);
      return;
    }

    if (!formData.shortDescription || formData.shortDescription.trim() === "") {
      addToast({
        title: "Validation Error",
        description: "Short description is required.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(1);
      return;
    }

    if (!formData.category || formData.category.trim() === "") {
      addToast({
        title: "Validation Error",
        description: "Category is required.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(1);
      return;
    }

    if (missingCover) {
      addToast({
        title: "Validation Error",
        description: "Cover image is required (no existing image on IPFS).",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(1);
      return;
    }

    if (!formData.coursePrice || formData.coursePrice <= 0) {
      addToast({
        title: "Validation Error",
        description: "Course price must be greater than zero.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(2);
      return;
    }

    if (!formData.sections || formData.sections.length === 0) {
      addToast({
        title: "Validation Error",
        description: "At least one section with lessons is required.",
        color: "danger",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setCurrentStep(3);
      return;
    }

    // if ok
    handleSubmit(onSubmit)();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const existingImagePreviewUrl = useMemo(() => {
    const cid = existingIpfs?.imageCid;
    if (!cid) return null;
    // pinata gateway used in your utils (best-effort here)
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }, [existingIpfs?.imageCid]);

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
                      {isEditMode ? "Edit Course Information" : "Course Information"}
                    </h1>
                    <p className="text-base text-gray-600">
                      {isEditMode
                        ? "Update the information for your existing course"
                        : "Provide basic information about your course"}
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
                        selectedKeys={watch("category") ? [watch("category")] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0];
                          setValue("category", selected as string, {
                            shouldValidate: true,
                          });
                        }}
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

                    {/* Existing Cover Preview (edit mode) */}
                    {isEditMode && existingImagePreviewUrl && !watch("coverImage") && (
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="text-sm text-gray-700 mb-2">
                          Current cover image (IPFS):
                        </div>
                        <img
                          src={existingImagePreviewUrl}
                          alt="Existing cover"
                          className="w-full max-w-[520px] rounded-lg border border-gray-100"
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          You can upload a new cover image below to replace it.
                        </div>
                      </div>
                    )}

                    {/* File Upload */}
                    <FileUpload
                      accept="image/*"
                      error={errors.coverImage}
                      isRequired={!isEditMode && true}
                      name="coverImage"
                      setValue={setValue}
                      value={getValues("coverImage")}
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
                  watch={watch}
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
                  <div className="flex justify-end gap-3">
                    {currentStep > 1 && (
                      <Button
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50"
                        size="md"
                        variant="bordered"
                        onPress={handleBack}
                      >
                        Back
                      </Button>
                    )}
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

              {/* Debug info (optional) */}
              {/* <pre>{JSON.stringify(getValues(), null, 2)}</pre> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
