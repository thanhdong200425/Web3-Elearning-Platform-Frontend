import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const keyConceptSchema = z.object({
  title: z.string().describe("Title of the key concept"),
  description: z
    .string()
    .describe("Detailed description explaining the concept"),
});

const lessonSchema = z.object({
  id: z.string().describe("Unique identifier (e.g., 'lesson-1-1')"),
  title: z.string().describe("Title of the lesson"),
  duration: z
    .string()
    .describe("Estimated duration (e.g., '12 min')")
    .optional(),
  type: z.enum(["lesson", "quiz", "case-study"]).describe("Type of lesson"),

  overview: z.string().describe("Comprehensive overview of the lesson"),
  content: z.string().describe("Detailed content of the lesson"),
  keyConcepts: z.array(keyConceptSchema).describe("Key concepts covered"),
});

const moduleSchema = z.object({
  id: z.string().describe("Unique identifier (e.g., 'module-1')"),
  title: z.string().describe("Title of the module"),
  lessons: z
    .array(lessonSchema)
    .describe("Array of lessons with their full content"),
});

const courseSchema = z.object({
  courseTitle: z.string().describe("Title of the entire course"),
  modules: z
    .array(moduleSchema)
    .describe("Course modules containing all lessons and content"),
});

export type Course = z.infer<typeof courseSchema>;
export type Module = z.infer<typeof moduleSchema>;
export type Lesson = z.infer<typeof lessonSchema>;

interface GenerateCourseContentParams {
  topic: string;
  contentFormat?: "full-course" | "study-guide" | "learning-path";
  includeAssessments?: boolean;
}

export async function generateCourseContent({
  topic,
  contentFormat = "full-course",
  includeAssessments = true,
}: GenerateCourseContentParams): Promise<Course> {
  try {
    const formatInstructions = {
      "full-course":
        "Create a comprehensive full course with multiple modules, each containing several lessons. Include detailed content for each lesson.",
      "study-guide":
        "Create a condensed study guide format with key modules and essential lessons. Focus on the most important concepts.",
      "learning-path":
        "Create a step-by-step learning path that guides the student through progressive modules building upon each other.",
    };

    const assessmentInstruction = includeAssessments
      ? "Include interactive assessments (quizzes) throughout the course to test understanding. Add at least one quiz per module."
      : "Focus on instructional content without assessments.";

    const prompt = `You are an expert AI tutor specializing in creating comprehensive, engaging, and pedagogically sound educational content.

Your task is to create a complete course structure for the topic: "${topic}"

${formatInstructions[contentFormat]}

${assessmentInstruction}

Requirements:
1. Create a course includes a title in this key name: 'courseTitle' and modules (should 3 - 4 modules)
2. Each module MUST have an 'id' (e.g., 'module-1') and a 'title'.
3. Each lesson MUST have an 'id' (e.g., 'lesson-1-1'), 'title', 'type', 'content', 'overview', and 'keyConcepts'. The content part should include text only without any code snippets or lists.
4: Lesson type MUST be one of these values: 'lesson', 'quiz', or 'case-study'.
5: Key concepts MUST include a 'title' and a detailed 'description'. please don't include ';' at the end of description.

Please structure the response strictly in JSON format according to the schema provided.

Generate a complete course structure with all modules, lessons, and detailed lesson content.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(courseSchema),
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
      throw new Error("Failed to parse AI response as  with error: " + e);
    }

    console.log("AI Response:", result);

    const courseData = courseSchema.parse(result);

    return courseData;
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
}
