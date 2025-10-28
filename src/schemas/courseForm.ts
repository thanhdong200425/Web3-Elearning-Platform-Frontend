import { z } from 'zod';

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(80, 'Title must be 80 characters or less'),
  shortDescription: z.string().min(1, 'Short description is required'),
  detailedDescription: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  coverImage: z.instanceof(File).optional(),
  // Web3 Configuration fields
  paymentToken: z.string().min(1, 'Payment token is required'),
  coursePrice: z.number().min(0, 'Course price must be positive'),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  // Course Content fields
  sections: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, 'Section title is required'),
    lessons: z.array(z.object({
      id: z.string(),
      title: z.string().min(1, 'Lesson title is required'),
      content: z.string().optional(),
      file: z.instanceof(File).optional(),
    })).optional(),
  })).optional().nullable(),
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

export const tokenOptions = [
  { value: 'USDC', label: 'USDC' },
  { value: 'USDT', label: 'USDT' },
  { value: 'ETH', label: 'ETH' },
  { value: 'MATIC', label: 'MATIC' },
];
