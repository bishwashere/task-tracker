"use client";
import SuperHeader from "@/components/common/block/super-header";
import ProfileMenu from "@/components/common/profile-menu";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { cn } from "@/lib/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  confirm,
} from "@/components/ui/alert-dialog";
import { useEditComment, useFetchSubtaskData, useResolveComment, useSaveComment, useUpdateSubtaskStatus } from "@/queries/subtask/hooks";
import EditSubtaskDialog from "@/app/(protected)/project/[slug]/tasks/_components/task-view/task-list/subtask-view/edit-subtask-dialog";
import { getProjectTasksPath } from "@/lib/project-slug";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const Subtask = () => {
  const { id } = useParams() as {
    id: string
  }
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { data: subtask, isLoading } = useFetchSubtaskData(id)
  const save = useSaveComment()
  const editCommentMutation = useEditComment()
  const [commentType, setCommentType] = useState("comment");
  const r = useResolveComment()
  const closeSubtask = useUpdateSubtaskStatus()

  const startEditing = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditText(text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const onSaveEdit = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await editCommentMutation.mutateAsync({
        commentId,
        subtaskId: id,
        projectId: subtask.task.project.id,
        userComment: editText,
      });
      cancelEditing();
      toast.success("Comment updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update comment.");
    }
  };

  const onSubmit = async (issue: boolean) => {

    if (!comment) {
      toast.error("Please type comment !");
      return;
    }

    setCommentType(issue ? "issue" : "comment");

    try {
      await save.mutateAsync({
        subtaskId: id,
        projectId: subtask.task.project.id,
        userComment: comment,
        commentType: issue ? "issue" : "comment",
      })
      setComment("");
    } catch { }
  };

  const onCloseSubtask = async () => {
    if (!subtask.comments?.length) {
      toast.error("Add a comment before closing this subtask.");
      return;
    }

    const shouldClose = await confirm({
      title: "Close subtask?",
      description: "This will mark the subtask as done.",
      confirm: "Close",
    });

    if (!shouldClose) return;

    try {
      await closeSubtask.mutateAsync({
        subtaskId: id,
        status: "done",
        projectId: subtask.task.project.id,
        taskId: subtask.task.id,
      });
      toast.success("Subtask closed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not close subtask.");
    }
  };

  if (isLoading && !subtask)
    return <Loading />
  if (!subtask)
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-3xl font-semibold">Access Denied :(</p>
        <p className="text-xl font-semibold mt-2">
          Contact organization admin !
        </p>
        <Link
          href="/dashboard"
          className="text-white text-lg bg-blue-600 px-4 py-2 rounded-xl mt-10"
        >
          Go to Dashboard
        </Link>
      </div>
    );

  if (subtask.isBlockedByDependency && subtask.blockedByDependency) {
    return (
      <>
        <div>
          <SuperHeader path={getProjectTasksPath(subtask.task.project.slug)} />
        </div>
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Subtask is blocked</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-foreground">
                This subtask depends on &quot;{subtask.blockedByDependency.name}&quot;.
                Complete that subtask before starting this one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction asChild>
                <Link href={getProjectTasksPath(subtask.task.project.slug)}>
                  Back to task
                </Link>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div>
        <SuperHeader path={getProjectTasksPath(subtask.task.project.slug)} />
      </div>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
          <h1 className="text-3xl font-bold">Subtask Details</h1>
          <ProfileMenu
          showSettings={false}
          organizationId={subtask?.task?.project?.organizationId}
        />
        </div>

        <div className="bg-gray-100 p-6 rounded shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
            <h2 className="text-2xl font-bold">{subtask.name}</h2>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {subtask.role === "admin" && (
                <EditSubtaskDialog
                  canEdit={subtask.role === "admin"}
                  projectId={subtask.task.project.id}
                  taskId={subtask.task.id}
                  subtaskId={subtask.id}
                  defaultValue={{
                    subtaskName: subtask.name,
                    dueDate: subtask.dueDate
                      ? new Date(subtask.dueDate).toISOString().split("T")[0]
                      : "",
                    points: subtask.points,
                    assignedUserId: subtask.assignedUserId || "",
                    dependsOnSubtaskId: subtask.dependsOnSubtaskId || "",
                  }}
                  trigger={
                    <Button type="button" variant="outline">
                      Edit
                    </Button>
                  }
                />
              )}
              {subtask.role !== "admin" && subtask.status !== "done" && (
                <Button
                  variant="blue"
                  loading={closeSubtask.isPending}
                  disabled={closeSubtask.isPending}
                  onClick={onCloseSubtask}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Task: <span className="font-semibold">{subtask.task?.name}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Assigned To:{" "}
            <span className="font-semibold">
              {subtask.assignedUserId
                ? subtask.assignedUser?.name
                : "Unassigned"}
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Points:{" "}
            <span className="font-semibold">{subtask.points} points</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Due Date:{" "}
            <span className="font-semibold">
              {subtask.dueDate
                ? new Date(subtask.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })
                : "No due date"}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            Status: <span className="font-semibold">{subtask.status}</span>
          </p>
          {subtask.dependsOnSubtask && (
            <p className="text-sm text-gray-600 mt-2">
              Depends on:{" "}
              <span className="font-semibold">
                {subtask.dependsOnSubtask.name} ({subtask.dependsOnSubtask.status})
              </span>
            </p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          <div
          >
            <textarea
              className="border p-2 w-full rounded mb-4 min-h-24 resize-y"
              placeholder="Add a comment..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex items-center gap-4">
              <Button
                variant={"blue"}
                loading={save.isPending && commentType === "comment"}
                disabled={save.isPending}
                onClick={() => onSubmit(false)}
              >
                Add Comment
              </Button>
              <Button
                loading={save.isPending && commentType === "issue"}
                disabled={save.isPending}
                variant={"destructive"}
                onClick={() => onSubmit(true)}
              >
                Add Issue
              </Button>
            </div>
          </div>

          <ul className="mt-4 space-y-4">
            {subtask?.comments?.length > 0 ? (
              subtask?.comments.sort
                // sort latest
                ((a: any, b: any) => {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .
                map((c: any) => {
                  const isEditing = editingCommentId === c.id;

                  return (
                    <li
                      key={c.id}
                      className={cn(
                        "border-b pb-2 border-gray-200 flex justify-between gap-4",
                        c.commentType === "issue" ? "text-red-500" : "",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {c.user.name}{" "}
                          {c.commentType === "issue" && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-500">
                              Issue
                            </span>
                          )}
                        </p>
                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              className="border p-2 w-full rounded min-h-20 resize-y text-gray-900"
                              rows={3}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="blue"
                                size="sm"
                                loading={editCommentMutation.isPending}
                                disabled={editCommentMutation.isPending}
                                onClick={() => onSaveEdit(c.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={editCommentMutation.isPending}
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                              {c.comment}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 items-start shrink-0 flex-col">
                        {subtask.canManageComments && !isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditing(c.id, c.comment)}
                            className="px-2 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        )}
                        {c.commentType === "issue" &&
                          (!c.resolved ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.currentTarget.disabled = true;
                                r.mutate({ commentId: c.id, subtaskId: id })
                              }}
                              className="px-2 py-1 text-sm bg-green-100 text-green-500 rounded-md disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                              Resolved
                            </span>
                          ))}
                      </div>
                    </li>
                  );
                })
            ) : (
              <p className="text-gray-500">No comments available.</p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Subtask;
