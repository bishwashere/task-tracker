"use client";

import { useDashboardContext } from "@/context/dashboard-context";
import { useViewAsContext } from "@/context/view-as-context";
import { Eye, X } from "lucide-react";

export default function ViewAsBanner() {
  const { selectedOrg } = useDashboardContext();
  const { isViewingAs, viewingAsUser, clearViewAs } = useViewAsContext();

  if (!selectedOrg || !isViewingAs || !viewingAsUser) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-950">
      <div className="flex items-center gap-2">
        <Eye className="size-4 shrink-0" />
        <span>
          Viewing as{" "}
          <strong>{viewingAsUser.name || viewingAsUser.email || "member"}</strong>
          {" "}in {selectedOrg.organization.name}
        </span>
      </div>
      <button
        type="button"
        onClick={() => clearViewAs()}
        className="inline-flex items-center gap-1 rounded-md border border-amber-400 bg-white px-2.5 py-1 text-xs font-medium hover:bg-amber-50"
      >
        <X className="size-3.5" />
        Exit View As
      </button>
    </div>
  );
}
