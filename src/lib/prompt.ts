import { SuggestProjectSubtasks } from "./ai";

export const suggestProjectTaskPrompt = (
  projectTitle: string,
  projectDescription: string,
) => `
**Prompt:**
"Generate 3-5 strictly relevant tasks for given project, to get it started. Return the response as a plain JSON array of objects with the following format:
\`\`\`json
[
  {
    "title": "Task Title",
    "description": "Task Description"
  }
]
\`\`\`
Do not include any additional messages, explanations, or formatting—just return the JSON response in the specified format."
Project Title: ${projectTitle}
Project Description: ${projectDescription}
`;

export const suggestSubtaskPrompt = ({
  projectDescription,
  projectName,
  taskTitle,
  taskDescription,
}: SuggestProjectSubtasks) => `
**Prompt:**
"Generate 3-5 strictly relevant subtasks for the given task to break it down into smaller actionable steps. Return the response as a plain JSON array of objects with the following format:
\`\`\`json
[
  {
    "title": "Subtask Title"
  }
]
\`\`\`
Do not include any additional messages, explanations, or formatting—just return the JSON response in the specified format."
Project Title: ${projectName}
Task Title: ${taskTitle}
Task Description: ${taskDescription}
Project Description: ${projectDescription}
`;

type ProjectInsightsPromptProps = {
  data: { projectName: string; projectDescription: string; task: { name: string; description: string; subtask: { name: string; status: string; }[]; }[]; }
}

export const projectInsightsPrompt = ({ data }: ProjectInsightsPromptProps) => `
Project Information: ${JSON.stringify(data)}
`;

export type SprintBriefingSubtask = {
  name: string;
  taskName: string;
  assignee: string | null;
  status: string;
  dueDate: string | null;
  points: number;
};

export const sprintBriefingPrompt = ({
  projectName,
  sprintName,
  subtasks,
}: {
  projectName: string;
  sprintName: string;
  subtasks: SprintBriefingSubtask[];
}) => `
Write a short update message an admin will paste to their team (Slack, email, etc.).

Context:
- Project: ${projectName}
- Sprint: ${sprintName}
- Recently added subtasks (newest first): ${JSON.stringify(subtasks)}

Rules:
- MUST begin with exactly: "Next, we're focusing on:"
- Do NOT use em dashes. Use commas, periods, or colons instead.
- Keep it concise (2-4 sentences).
- Mention assignees by first name when assigned.
- Reference parent task names when helpful.
- Return ONLY the message text. No quotes, markdown, or extra formatting.
`;
