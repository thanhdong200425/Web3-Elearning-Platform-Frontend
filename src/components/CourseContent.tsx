import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CourseFormData } from '../schemas/courseForm';
import { Button } from '@heroui/button';
import FileUpload from './FileUpload'; // ⬅️ thêm import

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
  file?: File;
}

const CourseContent: React.FC<CourseContentProps> = ({ setValue, watch }) => {
  const sections = watch('sections') || [];
  const [isAddingSection, setIsAddingSection] = useState(false);

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: '',
      lessons: [],
    };

    const updatedSections = [...sections, newSection];
    setValue('sections', updatedSections);
    setIsAddingSection(true);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, title } : section
    );
    setValue('sections', updatedSections);
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = sections.filter((section) => section.id !== sectionId);
    setValue('sections', updatedSections);
  };

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
    };

    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, lessons: [...(section.lessons || []), newLesson] }
        : section
    );
    setValue('sections', updatedSections);
  };

  const updateLessonTitle = (sectionId: string, lessonId: string, title: string) => {
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
    setValue('sections', updatedSections);
  };

  // ⬇️ bổ sung: cập nhật nội dung text cho lesson (không ảnh hưởng UI cũ)
  const updateLessonContent = (sectionId: string, lessonId: string, content: string) => {
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
    setValue('sections', updatedSections);
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons?.filter((lesson) => lesson.id !== lessonId),
          }
        : section
    );
    setValue('sections', updatedSections);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-neutral-950">
          Course Content & IPFS Upload
        </h1>
        <p className="text-base text-gray-600">
          Build your course structure and upload content to decentralized storage
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
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
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
                      // lấy ipfs url/cid nếu đã upload xong (được FileUpload set vào form)
                      const ipfsCid =
                        (lesson as any)?.fileIpfsCid ?? undefined;
                      const ipfsUrl =
                        (lesson as any)?.fileUrl ?? undefined;

                      return (
                        <div
                          key={lesson.id}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >
                          {/* Hàng tiêu đề + delete */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xs text-gray-500">
                                {sectionIndex + 1}.{lessonIndex + 1}
                              </span>
                              <input
                                type="text"
                                placeholder="Enter lesson title"
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLessonTitle(section.id, lesson.id, e.target.value)
                                }
                                className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-950 placeholder-gray-400"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => deleteLesson(section.id, lesson.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>

                          {/* Nội dung & Upload asset */}
                          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Text content (optional) */}
                            <div className="flex flex-col">
                              <label className="text-xs font-medium text-neutral-950 mb-1">
                                Lesson Content (optional)
                              </label>
                              <textarea
                                value={lesson.content ?? ''}
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

                            {/* Upload asset -> IPFS */}
                            <div className="flex flex-col">
                              <FileUpload
                                name={`sections.${sectionIndex}.lessons.${lessonIndex}.file`}
                                setValue={setValue as any}
                                accept="video/*,application/pdf,application/zip"
                                isRequired={false}
                                className="w-full"
                              />

                              {/* Chip trạng thái IPFS (nếu có) */}
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
                                      {' '}
                                      —{' '}
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
    </div>
  );
};

export default CourseContent;
