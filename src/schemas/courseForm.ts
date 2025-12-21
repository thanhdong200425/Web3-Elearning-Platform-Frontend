import { z } from "zod";

export const courseFormSchema = z.object({
  // ===== Basic info (giữ nguyên) =====
  title: z
    .string()
    .min(1, "Course title is required")
    .max(80, "Title must be 80 characters or less"),
  shortDescription: z.string().min(1, "Short description is required"),
  detailedDescription: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),

  // Ảnh bìa: file gốc (giữ nguyên)
  coverImage: z.instanceof(File).optional(),
  // 👇 Thêm 2 field phụ để lưu kết quả upload IPFS (tùy chọn)
  coverImageIpfsCid: z.string().optional(),
  coverImageUrl: z.string().url().optional(),

  // ===== Web3 config (giữ nguyên) =====
  paymentToken: z.string().min(1, "Payment token is required"),
  coursePrice: z.number().positive("Course price must be greater than 0"),
  walletAddress: z.string().min(1, "Wallet address is required"),

  // ===== Course content (giữ nguyên + bổ sung IPFS cho lesson file) =====
  sections: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Section title is required"),
        lessons: z
          .array(
            z.object({
              id: z.string(),
              title: z.string().min(1, "Lesson title is required"),
              content: z.string().optional(),
              contentType: z.enum(["text", "video"]).default("text"),

              // file upload gốc (giữ nguyên)
              file: z.instanceof(File).optional(),

              // 👇 field phụ sau khi upload file bài học lên IPFS
              fileIpfsCid: z.string().optional(),
              fileUrl: z.string().url().optional(),
            })
          )
          .optional(),
      })
    )
    .optional()
    .nullable(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export const categoryOptions = [
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "blockchain", label: "Blockchain" },
  { value: "other", label: "Other" },
];

export const tokenOptions = [
  { value: "ETH", label: "ETH" },
  { value: "USDC", label: "USDC" },
  { value: "USDT", label: "USDT" },
  { value: "MATIC", label: "MATIC" },
];
