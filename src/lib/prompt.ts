import { SuggestProjectSubtasks } from "./ai";

export const suggestProjectTaskPrompt = (
  projectTitle: string,
  projectDescription: string
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
