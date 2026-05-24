"use client";

import { useDashboardContext } from "@/context/dashboard-context";
import { useViewAsContext } from "@/context/view-as-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSetViewAsUser,
  useViewAsMembers,
} from "@/queries/view-as/hooks";
import { cn } from "@/lib/cn";
import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  organizationId?: string;
};

export default function ViewAsMenu({ onClose, organizationId }: Props) {
  const { selectedOrg } = useDashboardContext();
  const { isViewingAs, viewingAsUser } = useViewAsContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  const orgId = organizationId ?? selectedOrg?.organizationId ?? "";
  const { data: members = [], isLoading, isError } = useViewAsMembers(
    orgId,
    dialogOpen && !!orgId,
  );
  const setViewAs = useSetViewAsUser(orgId);

  if (!orgId) {
    return null;
  }

  const handleSelect = async (userId: string | null) => {
    try {
      await setViewAs.mutateAsync(userId);
      setDialogOpen(false);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update View As");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onClose();
          setDialogOpen(true);
        }}
        className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
      >
        <Eye className="size-4" />
        View as
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>View as</DialogTitle>
            <DialogDescription>
              Preview the app as a team member. You stay signed in as admin.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto space-y-1 pt-2">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              disabled={setViewAs.isPending}
              className={cn(
                "w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                !isViewingAs
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-border",
              )}
            >
              <span className="block font-medium">Yourself (admin)</span>
              <span className="block text-xs text-muted-foreground">
                Exit member preview
              </span>
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" />
                Loading members...
              </div>
            ) : isError ? (
              <p className="py-4 text-sm text-red-500 text-center">
                You can only use View As for organizations you admin.
              </p>
            ) : members.length === 0 ? (
              <p className="py-4 text-sm text-gray-500 text-center">
                No members yet. Add people via Settings → Add Members.
              </p>
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  disabled={setViewAs.isPending}
                  onClick={() => handleSelect(member.id)}
                  className={cn(
                    "w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                    viewingAsUser?.id === member.id
                      ? "border-blue-200 bg-blue-50 text-blue-800"
                      : "border-border",
                  )}
                >
                  <span className="block font-medium">
                    {member.name || "Unnamed member"}
                  </span>
                  {member.email && (
                    <span className="block text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
