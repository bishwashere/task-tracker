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
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type ViewAsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
};

function isMemberRole(role: string) {
  return String(role).toUpperCase() === "MEMBER";
}

function toViewAsMember(member: {
  user: { id: string; name: string | null; email: string | null };
  role: string;
}) {
  return {
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  };
}

export function ViewAsDialog({
  open,
  onOpenChange,
  organizationId,
}: ViewAsDialogProps) {
  const { selectedOrg } = useDashboardContext();
  const { isViewingAs, viewingAsUser } = useViewAsContext();
  const { data: session } = useSession();

  const orgId =
    organizationId ??
    selectedOrg?.organization?.id ??
    selectedOrg?.organizationId ??
    "";

  const { data: serverMembers = [], isLoading, isError, refetch } = useViewAsMembers(
    orgId,
    open && !!orgId,
  );
  const setViewAs = useSetViewAsUser(orgId);

  const clientMembers = useMemo(() => {
    if (!selectedOrg?.organization?.members?.length) return [];

    const selectedOrgId =
      selectedOrg.organization.id ?? selectedOrg.organizationId;

    if (orgId && selectedOrgId !== orgId) return [];

    const excludeUserId = session?.user?.id;
    const excludeEmail = session?.user?.email?.toLowerCase();

    return selectedOrg.organization.members
      .filter((member) => {
        if (!isMemberRole(member.role)) return false;
        if (excludeUserId && member.user.id === excludeUserId) return false;
        if (
          excludeEmail &&
          member.user.email?.toLowerCase() === excludeEmail
        ) {
          return false;
        }
        return true;
      })
      .map(toViewAsMember)
      .sort((a, b) =>
        (a.name || a.email || "").localeCompare(b.name || b.email || ""),
      );
  }, [
    orgId,
    selectedOrg,
    session?.user?.email,
    session?.user?.id,
  ]);

  const members =
    clientMembers.length > 0 ? clientMembers : serverMembers;

  const handleSelect = async (userId: string | null) => {
    if (!orgId) {
      toast.error("Select an organization first.");
      return;
    }

    try {
      await setViewAs.mutateAsync(userId);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update View As");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen && orgId) {
      void refetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>View as</DialogTitle>
          <DialogDescription>
            Choose a team member to preview the app as they see it.
          </DialogDescription>
        </DialogHeader>

        {!orgId ? (
          <p className="py-4 text-sm text-gray-500 text-center">
            Select an organization to use View As.
          </p>
        ) : (
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

            {isLoading && clientMembers.length === 0 && serverMembers.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" />
                Loading members...
              </div>
            ) : isError && members.length === 0 ? (
              <p className="py-4 text-sm text-red-500 text-center">
                You can only use View As for organizations you admin.
              </p>
            ) : members.length === 0 ? (
              <p className="py-4 text-sm text-gray-500 text-center">
                No members with the Member role yet. In Settings, add users with
                the Member role (not Admin).
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
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ViewAsMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-row gap-3 items-center w-full px-3 py-1 text-left hover:bg-gray-100 text-md"
    >
      <Eye className="size-4" />
      View as
    </button>
  );
}
