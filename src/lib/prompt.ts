export const suggestProjectTaskPrompt = (
  projectTitle: string,
  projectDescription: string
) => `
Here's your AI prompt:  

**Prompt:**  
"I will provide you with a project title and description. Your task is to generate 5-6 strictly relevant tasks for tracking project progress.  

Return the response as a plain JSON array of objects with the following format:  

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
