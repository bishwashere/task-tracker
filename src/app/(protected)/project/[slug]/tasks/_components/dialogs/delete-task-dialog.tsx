import React from "react";
import { MdDelete } from "react-icons/md";
import { confirm } from "@/components/ui/alert-dialog";
import { useDeleteTask } from "@/queries/tasks/hooks";
import toast from "react-hot-toast";
import { useProjectContext } from "../../_context";

type Props = {
  taskId?: string;
};

const DeleteTask = (props: Props) => {
  const { projectId } = useProjectContext();
  const del = useDeleteTask()
  const onClick = async () => {
    const confirmed = await confirm(
      {
        title: undefined,
        description: `Are you sure you want to delete this task`,
      }
    );

    if (!confirmed) return;
    try {
      await del.mutateAsync({
        taskId: props.taskId as string,
        projectId,
      })
      toast.success("Task deleted successfully")
    } catch { }

  };

  return (
    <button className="px-1 w-4" onClick={onClick}>
      <MdDelete className="text-red-600 " />
    </button>
  );
};

export default DeleteTask;
