"use client";

import { getTaskSprintInfo } from "@/lib/sprint";
import { cn } from "@/lib/cn";

type Props = {
  sprintInfo: ReturnType<typeof getTaskSprintInfo>;
};

const TaskSprintLabel = ({ sprintInfo }: Props) => {
  if (!sprintInfo) return null;

  return (
    <span
      title={sprintInfo.status}
      className={cn(
        "text-xs font-normal shrink-0",
        sprintInfo.status === "Done" ? "text-green-700" : "text-amber-700",
      )}
    >
      Sprint: {sprintInfo.name}
    </span>
  );
};

export default TaskSprintLabel;
