import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react";
import { useSaveTask } from "@/queries/tasks/hooks";
import { useProjectContext } from "../../_context";

const AddTaskDialog = ({
  modalIsOpen,
  setModalIsOpen,
}: {
  modalIsOpen: boolean;
  setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  const [formData, setFormData] = useState({
    taskTitle: "",
    taskDescription: "",
  });

  const save = useSaveTask();
  const { projectId } = useProjectContext();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.taskTitle.trim()) return;
    try {
      await save.mutateAsync({
        projectId,
        taskTitle: formData.taskTitle,
        taskDescription: formData.taskDescription,
      })
      setModalIsOpen(false);
      setFormData({ taskTitle: "", taskDescription: "" });
    } catch { }
  };

  return (
    <Dialog
      open={modalIsOpen}
      onOpenChange={setModalIsOpen}
    >
      <DialogContent
        className="w-[100%] md:w-96 px-10 py-10"
      >
        <div className="w-full flex">
          <h3 className="text-2xl font-semibold">Add Task</h3>
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
          <div className="flex justify-end mt-5">
            <Button
              loading={save.isPending}
              className="mr-2">
              Add Task
            </Button>
            <Button
              type="reset"
              onClick={() => {
                setFormData({ taskTitle: "", taskDescription: "" })
                setModalIsOpen(false)
              }}
              variant={"muted"}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

  );
};

export default AddTaskDialog;
