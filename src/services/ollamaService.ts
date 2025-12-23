import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { CourseContent } from "@/types/courseTypes";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "deepseek-r1:8b";

const lessonSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const sectionSchema = z.object({
  title: z.string(),
  lessons: z.array(lessonSchema),
});

const courseContentSchema = z.object({
  sections: z.array(sectionSchema),
});

interface GenerateCourseContentParams {
  topic: string;
  signal?: AbortSignal;
  onStream?: (content: CourseContent) => void;
}

/**
 * Ollama sometimes generates empty strings as keys (e.g., "": "Title") 
 * or misses field names. This helper attempts to heal the JSON structure.
 */
function sanitizeOllamaResponse(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeOllamaResponse);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    let targetKey = key;
    
    // If the key is an empty string, we assume it was meant to be 'title'
    // as that's the most common failure point in the course structure.
    if (key === "" && typeof value === "string") {
      targetKey = "title";
    }

    sanitized[targetKey] = typeof value === "object" ? sanitizeOllamaResponse(value) : value;
  }

  return sanitized;
}

/**
 * Tries to repair a partial JSON string by closing open braces/brackets/strings.
 */
function repairJson(jsonStr: string): string {
    let balanceBraces = 0;
    let balanceBrackets = 0;
    let inString = false;
    let escaped = false;

    for (const char of jsonStr) {
        if (escaped) {
             escaped = false;
             continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (char === '{') balanceBraces++;
            if (char === '}') balanceBraces--;
            if (char === '[') balanceBrackets++;
            if (char === ']') balanceBrackets--;
        }
    }

    let repaired = jsonStr;
    if (inString) repaired += '"';
    
    // Close arrays and objects. 
    // Note: This is a simple heuristic. 
    for (let i = 0; i < balanceBrackets; i++) repaired += ']';
    for (let i = 0; i < balanceBraces; i++) repaired += '}';
    
    return repaired;
}

export async function generateCourseContent({
  topic,
  signal,
  onStream,
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
              "content": "Detailed lesson content here..."
            }
          ]
        }
      ]
    }

    Please structure the response strictly in JSON format according to the schema provided.`;

    const jsonSchema = zodToJsonSchema(courseContentSchema as any);
    
    // Ollama's API expects a raw JSON schema. 
    // zodToJsonSchema adds a "$schema" field which Ollama rejects with "invalid JSON schema".
    const { $schema, ...format } = jsonSchema as any;

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: true,
        format: format,
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to Ollama");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Ollama sends multiple JSON objects in one chunk sometimes, or across chunks
      // We need to parse valid JSON lines from the stream
      
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullResponse += json.response;
            
            // Try to parse partial JSON and notify listener
            if (onStream) {
               try {
                 // Attempt to repair the partial JSON to make it valid
                 const repaired = repairJson(fullResponse);
                 const partialParsed = JSON.parse(repaired);
                 const sanitized = sanitizeOllamaResponse(partialParsed);
                 
                 // Only emit if we have something meaningful (e.g. at least one section)
                 if (sanitized && (sanitized.sections || sanitized.courseTitle)) {
                    onStream(sanitized);
                 }
               } catch (e) {
                 // Ignore parsing errors for partial content
               }
            }
          }
          if (json.done) {
            break;
          }
        } catch (e) {
          console.error("Error parsing chunk", e);
        }
      }
    }
    
    let result;
    try {
      console.log("Raw Parsed Ollama Response:", fullResponse);
      const rawResult = JSON.parse(fullResponse);
      
      // Sanitize the response to handle missing or empty keys before Zod validation
      result = sanitizeOllamaResponse(rawResult);
      console.log("Sanitized Ollama Response:", result);
    } catch (e) {
      throw new Error("Failed to parse Ollama response as JSON: " + e);
    }

    const courseData = courseContentSchema.parse(result);

    return courseData as CourseContent;
  } catch (error) {
    console.error("Error generating course content with Ollama:", error);
    throw error;
  }
}
