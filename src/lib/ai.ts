import OpenAI from "openai";
import { suggestProjectTaskPrompt, suggestSubtaskPrompt } from "./prompt";
import { z } from "zod";

/**
 * Utilities related to ai
 */
class AI {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  private async chat(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() ?? "";
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
    const res = await this.chat(
      suggestProjectTaskPrompt(projectName, projectDescription),
    );

    try {
      const json = this.suggestedJSONParserSchema.parse(
        JSON.parse(this.extractJSON(res) || ""),
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
      description: z.string().optional().default(""),
    }),
  );

  private suggestedSubtaskJSONParserSchema = z.array(
    z.object({
      title: z.string(),
    }),
  );

  async suggestProjectSubtasks({
    projectName,
    taskTitle,
    taskDescription,
    projectDescription,
  }: SuggestProjectSubtasks): Promise<string[]> {
    const res = await this.chat(
      suggestSubtaskPrompt({
        projectName,
        taskTitle,
        taskDescription,
        projectDescription,
      }),
    );

    try {
      const json = this.suggestedSubtaskJSONParserSchema.parse(
        JSON.parse(this.extractJSON(res) || ""),
      );
      console.log("json", json);
      return json.map((item) => item.title);
    } catch {
      console.error("Failed to parse JSON", res);
      return [];
    }
  }

  async generate(prompt: string) {
    const res = await this.chat(prompt);

    return JSON.parse(this.extractJSON(res || "") || "");
  }
}

export interface SuggestProjectTasks {
  projectName: string;
  projectDescription: string;
}

export interface SuggestProjectSubtasks {
  projectName: string;
  taskTitle: string;
  taskDescription?: string;
  projectDescription: string;
}

export const ai = new AI();
