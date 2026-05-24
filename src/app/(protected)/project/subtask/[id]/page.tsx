"use client";
import SuperHeader from "@/components/common/block/super-header";
import ProfileMenu from "@/components/common/profile-menu";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { cn } from "@/lib/cn";
import { resolveComment } from "@/queries/subtask/action";
import { useFetchSubtaskData, useResolveComment, useSaveComment } from "@/queries/subtask/hooks";
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
  const { data: subtask, isLoading } = useFetchSubtaskData(id)
  const save = useSaveComment()
  const [commentType, setCommentType] = useState("comment");
  const r = useResolveComment()

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

  return (
    <>
      <div>
        <SuperHeader path={getProjectTasksPath(subtask.task.project.slug)} />
      </div>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
          <h1 className="text-3xl font-bold">Subtask Details</h1>
          <ProfileMenu showSettings={false} />
        </div>

        <div className="bg-gray-100 p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">{subtask.name}</h2>
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
                map((c: any, _id: any) => {
                  return (
                    <li
                      key={_id}
                      className={cn(
                        "border-b pb-2 border-gray-200 flex justify-between",
                        c.commentType === "issue" ? "text-red-500" : "",
                      )}
                    >
                      <div>
                        <p className="font-medium">
                          {" "}
                          {c.user.name}{" "}
                          {c.commentType === "issue" && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-500">
                              Issue
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                          {c.comment}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {/* badge */}
                      <div className="flex gap-2 items-center justify-center flex-col">
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
                            //badge
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                              Resolved
                            </span>
                          ))}
                      </div>
                      {/* resolve button */}
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
