import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { BiEditAlt } from "react-icons/bi";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { useEditTask } from "@/queries/tasks/hooks";

const EditTaskDialog = ({
  task,
  projectId,
}: {
  task: Task;
  projectId: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const edit = useEditTask()
  const [formData, setFormData] = useState({
    taskTitle: task.name,
    taskDescription: task.description || "",
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.taskTitle.trim()) return;

    try {
      edit.mutate({
        ...formData,
        projectId,
        taskId: task.id,
      })
      setModalIsOpen(false);
    } catch { }
  };

  return (
    <>
      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <DialogTrigger asChild>
          <button className="p-1">
            <BiEditAlt className="text-red-600" />
          </button>
        </DialogTrigger>
        <DialogContent
          className="w-[100%] md:w-96 px-10 py-10"

        >
          <div className="w-full flex">
            <h3 className="text-2xl font-semibold">Edit Task</h3>
          </div>
          {/* <hr className='border border-gray-300 my-6' /> */}
          <form className="mt-8" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Task Title"
              name="taskTitle"
              id="taskTitle"
              className="border p-2 rounded w-full mb-4"
              required
              onChange={(e) =>
                setFormData({ ...formData, taskTitle: e.target.value })
              }
              value={formData.taskTitle}
            />
            <textarea
              placeholder="Task Description"
              name="taskDescription"
              id="taskDescription"
              className="border p-2 rounded w-full h-24 mb-4"
              onChange={(e) =>
                setFormData({ ...formData, taskDescription: e.target.value })
              }
              value={formData.taskDescription}
            />
            <div className="flex justify-end mt-5">
              <Button
                loading={edit.isPending}
                className="mr-2"
              >
                Edit Task
              </Button>
              <Button
                type="reset"
                variant={"muted"}
                onClick={() => setModalIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
            {/* <hr className='border border-gray-300 my-6' /> */}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditTaskDialog;
