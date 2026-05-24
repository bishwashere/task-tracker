"use client";

import { useDashboardContext } from "@/context/dashboard-context";
import { useIsRealAdmin, useViewAsContext } from "@/context/view-as-context";
import { cn } from "@/lib/cn";
import { ChevronDown, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
};

export default function ViewAsMenu({ onClose }: Props) {
  const { selectedOrg } = useDashboardContext();
  const { isViewingAs, viewingAsUser, setViewAsUser } = useViewAsContext();
  const [expanded, setExpanded] = useState(false);

  const members = useMemo(
    () =>
      selectedOrg?.organization.members.filter(
        (member) => member.role !== "ADMIN",
      ) ?? [],
    [selectedOrg],
  );

  const isRealAdmin = useIsRealAdmin();

  if (!selectedOrg || !isRealAdmin) {
    return null;
  }

  const handleSelect = async (userId: string | null) => {
    try {
      await setViewAsUser(userId);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update View As");
    }
  };

  return (
    <>
      <hr className="border border-gray-300 my-1" />
      <div className="px-3 py-1">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 text-left text-md hover:text-blue-700"
        >
          <span className="inline-flex items-center gap-2">
            <Eye className="size-4" />
            View as
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
        </button>
        {expanded && (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100",
                !isViewingAs && "bg-blue-50 text-blue-700",
              )}
            >
              Yourself (admin)
            </button>
            {members.map((member) => (
              <button
                key={member.user.id}
                type="button"
                onClick={() => handleSelect(member.user.id)}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100",
                  viewingAsUser?.id === member.user.id && "bg-blue-50 text-blue-700",
                )}
              >
                <span className="block font-medium">
                  {member.user.name || "Unnamed member"}
                </span>
                {member.user.email && (
                  <span className="block text-xs text-gray-500">{member.user.email}</span>
                )}
              </button>
            ))}
            {members.length === 0 && (
              <p className="px-2 py-1 text-xs text-gray-500">No members to view as.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
