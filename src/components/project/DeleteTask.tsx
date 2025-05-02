import React from "react";
import { useConfirmModal } from "../Modal/useConfirmModal";
import { MdDelete } from "react-icons/md";
import { deleteTask } from "@/actions/task";
import { deleteSubtask } from "@/actions/subtask";
import toast from "react-hot-toast";

type Props = {
  taskId?: string;
  subTaskId?: string;
  onSuccess?: () => void;
};

const DeleteTask = (props: Props) => {
  const { confirmAction, ConfirmationModal } = useConfirmModal();

  const onClick = async () => {
    const confirmed = await confirmAction(
      `Are you sure you want to delete this ${props.taskId ? "task" : "subtask"}`,
    );

    if (!confirmed) return;
    if (props.taskId) {
      const res = await deleteTask(props.taskId);
      if (res.success) {
        toast.success(res.message);
        props.onSuccess?.();
      } else {
        toast.error(res.message);
      }
    } else if (props.subTaskId) {
      const res = await deleteSubtask(props.subTaskId);

      if (res.success) {
        toast.success(res.message);
        props.onSuccess?.();
      } else {
        toast.error(res.message);
      }
    }
  };

  return (
    <>
      <button className="px-1 w-4" onClick={onClick}>
        <MdDelete className="text-red-600 " />
      </button>
      <ConfirmationModal />
    </>
  );
};

export default DeleteTask;
