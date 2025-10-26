import { z } from 'zod';

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(80, 'Title must be 80 characters or less'),
  shortDescription: z.string().min(1, 'Short description is required'),
  detailedDescription: z.string().min(1, 'Detailed description is required'),
  category: z.string().min(1, 'Category is required'),
  coverImage: z.instanceof(File).optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export const categoryOptions = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'other', label: 'Other' },
];
