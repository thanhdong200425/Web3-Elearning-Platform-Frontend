import React, { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { CourseFormData } from "../../schemas/courseForm";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import FileUpload from "../forms/FileUpload";
import { generateCourseContent } from "../../services/aiService";
import { addToast } from "@heroui/toast";

interface CourseContentProps {
  setValue: UseFormSetValue<CourseFormData>;
  watch: UseFormWatch<CourseFormData>;
}

interface Section {
  id: string;
  title: string;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  contentType: "text" | "video";
  file?: File;
}

const CourseContent: React.FC<CourseContentProps> = ({ setValue, watch }) => {
  const sections = watch("sections") || [];
  const [isGenerating, setIsGenerating] = useState(false);

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      lessons: [],
    };

    const updatedSections = [...sections, newSection];
    setValue("sections", updatedSections);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, title } : section
    );
    setValue("sections", updatedSections);
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(
      (section) => section.id !== sectionId
    );
    setValue("sections", updatedSections);
  };

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "",
      contentType: "text",
    };

    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, lessons: [...(section.lessons || []), newLesson] }
        : section
    );
    setValue("sections", updatedSections);
  };

  const updateLessonTitle = (
    sectionId: string,
    lessonId: string,
    title: string
  ) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons?.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, title } : lesson
            ),
          }
        : section
    );
    setValue("sections", updatedSections);
  };

  // ⬇️ bổ sung: cập nhật nội dung text cho lesson (không ảnh hưởng UI cũ)
  const updateLessonContent = (
    sectionId: string,
    lessonId: string,
    content: string
  ) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons?.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, content } : lesson
            ),
          }
        : section
    );
    setValue("sections", updatedSections);
  };

  const updateLessonContentType = (
    sectionId: string,
    lessonId: string,
    contentType: "text" | "video"
  ) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons?.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, contentType } : lesson
            ),
          }
        : section
    );
    setValue("sections", updatedSections);
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons?.filter(
              (lesson) => lesson.id !== lessonId
            ),
          }
        : section
    );
    setValue("sections", updatedSections);
  };

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);

      // Get title and description from the form
      const title = watch("title");
      const description =
        watch("shortDescription") || watch("detailedDescription");

      if (!title || title.trim() === "") {
        addToast({
          title: "Title Required",
          description: "Please enter a course title before generating content",
          color: "danger",
        });
        return;
      }

      addToast({
        title: "Generating Content",
        description: "AI is creating your course structure...",
        color: "default",
      });

      // Generate content using AI
      const topic = description ? `${title}: ${description}` : title;
      const generatedContent = await generateCourseContent({ topic });

      // Transform generated content to match form structure
      const formattedSections: Section[] = (
        generatedContent.sections || []
      ).map((section, sectionIndex) => ({
        id: `section-${Date.now()}-${sectionIndex}`,
        title: section.title,
        lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
          id: `lesson-${Date.now()}-${sectionIndex}-${lessonIndex}`,
          title: lesson.title,
          content: lesson.content || "",
          contentType: "text" as const, // Only text for now as per requirements
          file: undefined,
        })),
      }));

      // Set the generated sections
      setValue("sections", formattedSections);

      addToast({
        title: "Content Generated",
        description: `Successfully created ${formattedSections.length} sections with lessons`,
        color: "success",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      addToast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "Failed to generate content",
        color: "danger",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-neutral-950">
          Course Content & IPFS Upload
        </h1>
        <p className="text-base text-gray-600">
          Build your course structure and upload content to decentralized
          storage
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Add Section Button */}
        <Button
          variant="bordered"
          size="md"
          onPress={addSection}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-gray-50 flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add Section
        </Button>

        {/* Sections List */}
        {sections.length > 0 && (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      Section {sectionIndex + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Enter section title"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(section.id, e.target.value)
                      }
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-neutral-950 placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => addLesson(section.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Add Lesson
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => deleteSection(section.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Lessons */}
                {section.lessons && section.lessons.length > 0 && (
                  <div className="ml-4 space-y-3">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const ipfsCid = (lesson as any)?.fileIpfsCid ?? undefined;
                      const ipfsUrl = (lesson as any)?.fileUrl ?? undefined;

                      return (
                        <div
                          key={lesson.id}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >
                          {/* Header: lesson number, title, and delete */}
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xs text-gray-500">
                                {sectionIndex + 1}.{lessonIndex + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Enter lesson title"
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLessonTitle(
                                    section.id,
                                    lesson.id,
                                    e.target.value
                                  )
                                }
                                className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-950 placeholder-gray-400"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() =>
                                deleteLesson(section.id, lesson.id)
                              }
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>

                          {/* Content Type Selector */}
                          <div className="mb-3">
                            <Select
                              label="Content Type"
                              placeholder="Select content type"
                              selectedKeys={[lesson.contentType]}
                              onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as
                                  | "text"
                                  | "video";
                                updateLessonContentType(
                                  section.id,
                                  lesson.id,
                                  selected
                                );
                              }}
                              classNames={{
                                trigger:
                                  "bg-gray-100 border-0 rounded-lg px-3 py-2 h-10",
                                label: "text-xs font-medium text-neutral-950",
                              }}
                              labelPlacement="outside"
                              size="sm"
                            >
                              <SelectItem key="text">Text</SelectItem>
                              <SelectItem key="video">Video</SelectItem>
                            </Select>
                          </div>

                          {/* Content based on type */}
                          {lesson.contentType === "text" && (
                            <div className="flex flex-col">
                              <label className="text-xs font-medium text-neutral-950 mb-1">
                                Lesson Content
                              </label>
                              <textarea
                                value={lesson.content ?? ""}
                                onChange={(e) =>
                                  updateLessonContent(
                                    section.id,
                                    lesson.id,
                                    e.target.value
                                  )
                                }
                                placeholder="Short description, links, notes…"
                                className="min-h-[96px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                              />
                            </div>
                          )}

                          {lesson.contentType === "video" && (
                            <div className="flex flex-col gap-3">
                              {/* Optional text description for video */}
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-neutral-950 mb-1">
                                  Video Description (optional)
                                </label>
                                <textarea
                                  value={lesson.content ?? ""}
                                  onChange={(e) =>
                                    updateLessonContent(
                                      section.id,
                                      lesson.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Short description about this video…"
                                  className="min-h-[64px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                              </div>

                              {/* Video Upload */}
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-neutral-950 mb-1">
                                  Upload Video
                                </label>
                                <FileUpload
                                  name={`sections.${sectionIndex}.lessons.${lessonIndex}.file`}
                                  setValue={setValue as any}
                                  accept="video/*"
                                  isRequired={false}
                                  className="w-full"
                                  label=""
                                  placeholder="Upload lesson video"
                                />

                                {/* IPFS Upload Status */}
                                {(ipfsCid || ipfsUrl) && (
                                  <div className="mt-2 text-xs text-green-700">
                                    Uploaded to IPFS:&nbsp;
                                    {ipfsCid && (
                                      <span className="font-medium break-all">
                                        CID: {ipfsCid}
                                      </span>
                                    )}
                                    {ipfsUrl && (
                                      <>
                                        {" "}
                                        —{" "}
                                        <a
                                          href={ipfsUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="underline"
                                        >
                                          Open
                                        </a>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 2L30 8V24L16 30L2 24V8L16 2Z"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 8V24M8 16H24"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sections added yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start building your course by adding sections and lessons
            </p>
            <Button
              variant="solid"
              size="md"
              onPress={addSection}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Your First Section
            </Button>
          </div>
        )}
      </div>

      {/* Floating AI Generate Button */}
      <Button
        isIconOnly
        onPress={handleGenerateContent}
        isLoading={isGenerating}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        title="Generate Content with AI"
      >
        {!isGenerating && (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="currentColor"
            />
            <path
              d="M19 3L19.5 5.5L22 6L19.5 6.5L19 9L18.5 6.5L16 6L18.5 5.5L19 3Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
        )}
      </Button>
    </div>
  );
};

export default CourseContent;
