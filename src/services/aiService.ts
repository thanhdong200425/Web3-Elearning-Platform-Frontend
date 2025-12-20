import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { CourseContent } from "@/types/courseTypes";
import { zodToJsonSchema } from "zod-to-json-schema";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const lessonSchema = z.object({
  title: z.string().describe("Title of the lesson"),
  content: z.string().describe("Detailed content of the lesson").optional(),
  type: z.enum(["text", "video"]).describe("Type of lesson").optional(),
});

const sectionSchema = z.object({
  title: z.string().describe("Title of the section"),
  lessons: z
    .array(lessonSchema)
    .describe("Array of lessons with their content")
    .optional(),
});

const courseContentSchema = z.object({
  sections: z
    .array(sectionSchema)
    .describe("Course sections containing lessons")
    .optional(),
});

export type GeneratedCourseContent = z.infer<typeof courseContentSchema>;

interface GenerateCourseContentParams {
  topic: string;
}

export async function generateCourseContent({
  topic,
}: GenerateCourseContentParams): Promise<CourseContent> {
  try {
    const prompt = `You are an expert AI tutor specializing in creating comprehensive, engaging, and pedagogically sound educational content.

    Your task is to create a complete course structure for the topic: "${topic}"

    Requirements:
    1. Create 3-5 sections, each with multiple lessons
    2. Each section MUST have a "title" field and a "lessons" array
    3. Each lesson MUST be a flat object with ONLY these fields:
      - "title" (string): The lesson title
      - "content" (string): Detailed educational content in clear paragraphs
      - "type" (string): Either "text" or "video"
    4. Do NOT nest lessons inside lessons - keep the structure flat
    5. The content should be comprehensive and educational

    Example structure:
    {
      "sections": [
        {
          "title": "Section Title",
          "lessons": [
            {
              "title": "Lesson Title",
              "content": "Detailed lesson content here...",
              "type": "text"
            }
          ]
        }
      ]
    }

    Please structure the response strictly in JSON format according to the schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(courseContentSchema as any),
      },
    });

    if (!response.text) {
      throw new Error("No response text received from AI model");
    }

    let result;

    try {
      console.log("Raw AI Response:", response.text);
      result = JSON.parse(response.text);
      console.log("Parsed AI Response:", result);
      if (typeof result === "string") {
        result = JSON.parse(result);
      }
    } catch (e) {
      throw new Error("Failed to parse AI response with error: " + e);
    }

    const courseData = courseContentSchema.parse(result);

    return courseData;
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
}
