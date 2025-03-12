import { GoogleGenerativeAI } from "@google/generative-ai";
import { suggestProjectTaskPrompt } from "./prompt";
import { z } from "zod";

/**
 * Utilities related to ai
 */
class AI {
  private genAI: GoogleGenerativeAI;
  private maxRetries = 3;
  private apiKeys: string[];

  constructor() {
    this.apiKeys = [
      process.env.GEMINI_API_KEY || "",
      process.env.GEMINI_API_KEY_1 || "",
      process.env.GEMINI_API_KEY_2 || "",
    ];
    this.genAI = new GoogleGenerativeAI(this.apiKeys[0]);
  }

  private isErrorWithStatus(error: unknown): error is { status: number } {
    return typeof error === "object" && error !== null && "status" in error;
  }
  /**
   * Gives the name of the chat from ai
   */
  async suggestProjectTasks({
    projectDescription,
    projectName,
  }: SuggestProjectTasks): Promise<
    {
      title: string;
      description: string;
    }[]
  > {
    const model = this.genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash-001",
    });

    const result = await model.generateContent(
      suggestProjectTaskPrompt(projectName, projectDescription)
    );

    const res = result.response.text().trim();

    try {
      const json = this.suggestedJSONParserSchema.parse(
        JSON.parse(this.extractJSON(res) || "")
      );
      console.log("json", json);
      return json;
    } catch {
      console.error("Failed to parse JSON", res);
      return [];
    }
  }

  private extractJSON(text: string): string | null {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    return match ? match[1] : null;
  }

  private suggestedJSONParserSchema = z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  );
}

export interface SuggestProjectTasks {
  projectName: string;
  projectDescription: string;
}

export const ai = new AI();
