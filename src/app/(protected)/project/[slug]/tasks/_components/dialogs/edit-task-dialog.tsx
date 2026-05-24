import { IoMdClose } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Task } from "@prisma/client";
import { useEditTask } from "@/queries/tasks/hooks";
import { useGetActiveSprint, useToggleSprintTask } from "@/queries/sprint/hooks";
import { formatSprintName } from "@/lib/sprint";

const EditTaskDialog = ({
  task,
  projectId,
}: {
  task: Task;
  projectId: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const edit = useEditTask();
  const toggleSprint = useToggleSprintTask(projectId);
  const { data: sprintData } = useGetActiveSprint(projectId);
  const activeSprint = sprintData?.sprint;

  const [formData, setFormData] = useState({
    taskTitle: task.name,
    taskDescription: task.description || "",
  });
  const [inSprint, setInSprint] = useState(false);
  const [initialInSprint, setInitialInSprint] = useState(false);

  useEffect(() => {
    if (!modalIsOpen) return;

    const currentlyInSprint = activeSprint?.taskIds.includes(task.id) ?? false;
    setFormData({
      taskTitle: task.name,
      taskDescription: task.description || "",
    });
    setInSprint(currentlyInSprint);
    setInitialInSprint(currentlyInSprint);
  }, [modalIsOpen, task, activeSprint]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.taskTitle.trim()) return;

    try {
      await edit.mutateAsync({
        ...formData,
        projectId,
        taskId: task.id,
      });

      if (activeSprint && inSprint !== initialInSprint) {
        await toggleSprint.mutateAsync(task.id);
      }

      setModalIsOpen(false);
    } catch { }
  };

  const isSaving = edit.isPending || toggleSprint.isPending;

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
            {activeSprint && (
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inSprint}
                  onChange={(e) => setInSprint(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                />
                <Label className="cursor-pointer font-normal">
                  Include in active sprint: {formatSprintName(activeSprint.name)}
                </Label>
              </label>
            )}
            <div className="flex justify-end mt-5">
              <Button
                loading={isSaving}
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditTaskDialog;
