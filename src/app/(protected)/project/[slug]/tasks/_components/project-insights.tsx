import { useProjectContext } from "../_context";
import { projectInsightsPrompt } from "@/lib/prompt";
import { useCreateInsights, useGetInsights, useGetInsightsFromSubredditsKeywords } from "@/queries/insights/hooks";
import { useGetProjectById } from "@/queries/project/hooks";
import { useEffect } from "react";

export type InsightsType = {
    insights: string[];
    id: string;
    updatedAt: Date;
    projectId: string;
    desiredOutcome: string[];
}

export const ProjectInsights = ({ id }: { id: string }) => {

    const { data: projectData, isPending: isProjectPending } = useGetProjectById(id);
    const { data: insightsData, isPending: isInsightsPending } = useGetInsights(id);
    const { role } = useProjectContext();

    const createInsights = useCreateInsights(id);
    const getInsights = useGetInsightsFromSubredditsKeywords(id);

    useEffect(() => {
        if (role !== "admin") return;
        if (isProjectPending || isInsightsPending) return;
        const insights: InsightsType | null = insightsData?.insights as InsightsType

        if (insights) {
            const today = new Date();
            const diffInDays = (today.getTime() - insights.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
            if ((!insights.insights.length || diffInDays > 1) && projectData?.project?.id && projectData.tasks.length) {
                //TODO : call refetchfetch insights api
                const data = {
                    projectName: projectData.project?.name || "",
                    projectDescription: projectData.project?.description || "",
                    task: projectData.tasks.map(task => ({
                        name: task.name || "",
                        description: task.description || "",
                        subtask: task.subtasks.map(sub => ({
                            name: sub.name || "",
                            status: sub.status || ""
                        }))
                    }))
                };
                // console.log(data);
                const prompt = projectInsightsPrompt({ data });
                console.log(prompt);
                getInsights.mutateAsync({ projectId: projectData.project.id, prompt, desiredOutcome: insights.desiredOutcome.join(", ") });
            }
        } else {
            if (projectData?.project?.id && projectData.tasks.length) {
                //TODO : create insights db with default deired outcome
                try {
                    createInsights.mutateAsync({ projectId: projectData.project.id })
                }
                catch { }
            }
        }
    }, [projectData, isProjectPending, insightsData, isInsightsPending, role])

    return (
        <div>

        </div>
    )
}