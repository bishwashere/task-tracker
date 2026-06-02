"use client";

import { useGenerateSprintBriefing } from "@/queries/tasks/hooks";
import { Copy, Loader2 } from "lucide-react";

type Props = {
  projectId: string;
};

export function SprintBriefingCopy({ projectId }: Props) {
  const { mutate, isPending } = useGenerateSprintBriefing();

  return (
    <button
      type="button"
      onClick={() => mutate(projectId)}
      disabled={isPending}
      title="Copy sprint briefing for your team"
      aria-label="Copy sprint briefing for your team"
      className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  );
}
