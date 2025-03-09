"use client";
import { saveComment } from "@/actions/subtask";
import FormSubmitButton from "@/components/common/FormSubmitButton";
import ProfileMenu from "@/components/common/ProfileMenu";
import SuperHeader from "@/components/headers/SuperHeader";
import { fetchSubtaskData } from "@/data/subtask";
import { CommentType, SubtaskType } from "@/types/organization";
import { Session } from "next-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Subtask = ({ session, subtaskId }: { session: Session, subtaskId: string;  }) => {
    
    const [initialLoading, setInitialLoading] = useState(true)

    const [comments, setComments] = useState<CommentType[]>([])
    const [comment, setComment] = useState('');
    const [subtask, setSubtask] = useState<SubtaskType>()
    const [assignedUser, setAssignedUser] = useState<string | null>(null)

    const fetchSubtaskAndComment = async() => {
        const res = await fetchSubtaskData(subtaskId);
        if(res.success){
            setSubtask(res.subtask as SubtaskType);
            setComments(res.comments as CommentType[]);
            setAssignedUser(res.assignedUser as string | null);
        }
        setInitialLoading(false);
    }
    useEffect(()=>{
        fetchSubtaskAndComment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const submitComment = async (subtaskId:string, projectId:string) => {
        if (!comment) {
            toast.error("Please type comment !");
            return;
        }
        const res = await saveComment(subtaskId, projectId, comment);
        if (res.success) {
            setComment('');
            setComments([...comments, res.comment as CommentType]);
        } else {
            toast.error(res.message || "An error occurred");
        }
    }
    if(initialLoading) return <div className="text-center text-xl font-bold">Loading...</div>
    if(!subtask) return (
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-3">
            <p className="text-3xl font-semibold">Something went wrong :(</p>
            <p className="text-xl font-semibold">Try again !</p>
            <Link href="/dashboard" className="text-white text-lg bg-blue-600 px-4 py-2 rounded-xl mt-10">Go to Dashboard</Link>
        </div>
    )
    
    return (
        <>
            <div>
                <SuperHeader path={`/project/${subtask.task.project.id}`} />
            </div>
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Subtask Details</h1>
                    <ProfileMenu session={session} showSettings={false} />
                </div>

                <div className="bg-gray-100 p-6 rounded shadow-md">
                    <h2 className="text-2xl font-bold mb-4">{subtask.name}</h2> {/* Updated */}
                    <p className="text-sm text-gray-600 mb-2">
                        Task: <span className="font-semibold">{subtask.task.name}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Assigned To: <span className="font-semibold">{assignedUser || 'Unassigned'}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Points: <span className="font-semibold">{subtask.points} points</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        Due Date:{' '}
                        <span className="font-semibold">
                            {subtask.dueDate
                                ? new Date(subtask.dueDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: '2-digit',
                                    year: 'numeric',
                                })
                                : 'No due date'}
                        </span>
                    </p>

                    <p className="text-sm text-gray-600">
                        Status: <span className="font-semibold">{subtask.status}</span>
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Comments</h2>
                    <form action={()=>submitComment(subtask.id, subtask.task.project.id)}>
                        <textarea
                            className="border p-2 w-full rounded mb-4"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Add Comment
                        </FormSubmitButton>
                    </form>

                    <ul className="mt-4 space-y-4">
                        {comments?.length > 0 ? (
                            comments.map((c, _id) => (
                                <li key={_id} className="border-b pb-2">
                                    <p className="font-medium">{c.user.name}</p>
                                    <p className="text-sm text-gray-600">{c.comment}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </p>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500">No comments available.</p>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Subtask;