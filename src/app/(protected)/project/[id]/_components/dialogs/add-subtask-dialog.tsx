import { useGetProjectById } from "@/queries/project/hooks";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useSaveSubtask } from "@/queries/subtask/hooks";

const AddSubtaskDialog = ({
  taskId,
  projectId,
  showText = true,
  showAi = true,
}: {
  taskId: string;
  projectId: string;
  showText?: boolean;
  showAi: boolean;
}) => {
  const [showAiSuggestion, setShowAiSuggestion] = useState(showAi);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subtaskName: "",
    dueDate: "",
    points: 1,
    assignedUserId: "",
  });

  const save = useSaveSubtask()
  const { data } = useGetProjectById(projectId);
  useEffect(() => {
    setShowAiSuggestion(showAi);
  }, [showAi]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.subtaskName.trim()) return;
    try {
      await save.mutateAsync({
        projectId,
        taskId,
        subTaskName: formData.subtaskName,
        dueDate: new Date(formData.dueDate),
        points: formData.points,
        assignedUserId: formData.assignedUserId,
      })
      setModalIsOpen(false);
      setFormData({ subtaskName: "", dueDate: "", points: 1, assignedUserId: "" });
    } catch { }
  };

  return (
    <div className="absolute top-2 right-2 space-x-2 flex">
      {/* {showAiSuggestion && (
        <AISubtaskDialog
          taskId={taskId}
          projectId={projectId}
          onSubtaskAdded={(subtasks) => {
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === taskId
                  ? { ...task, subtasks: [...task.subtasks, ...subtasks] }
                  : task,
              ),
            );
            setShowAiSuggestion(false);
          }}
        />
      )} */}

      <Dialog
        open={modalIsOpen}
        onOpenChange={setModalIsOpen}
      >
        <DialogTrigger asChild>
          <button
            className="flex flex-row items-center gap-2"
          >
            {showText && <p className="text-blue-600">Add Subtask</p>}
            <span className="bg-gray-500 text-white w-8 h-8 flex items-center justify-center rounded hover:bg-gray-600 z-10">
              +
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className="w-[100%] md:w-96 px-10 py-10"

        >

          <div className="w-full flex">
            <h3 className="text-2xl font-semibold">Add Subtask</h3>
          </div>
          {/* <hr className='border border-gray-300 my-6' /> */}
          <form className="mt-8" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Subtask Name"
              name="subtaskName"
              id="subtaskName"
              value={formData.subtaskName}
              className="border p-2 rounded w-full mb-4"
              required
              onChange={(e) =>
                setFormData({ ...formData, subtaskName: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Due Date"
              id="dueDate"
              name="dueDate"
              className="border p-2 rounded w-full mb-4"
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              value={formData.dueDate}
            />
            <input
              type="number"
              placeholder="Points"
              id="points"
              name="points"
              defaultValue={1}
              min={1}
              className="border p-2 rounded w-full mb-4"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) })}
            />
            <select
              id="assignedUserId"
              name="assignedUserId"
              className="border p-2 rounded w-full mb-4"
              value={formData.assignedUserId}
              onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {data?.members?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end mt-5">
              <Button
                loading={save.isPending}
                variant={"blue"} className=" mr-2">
                Add Subtask
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
    </div>
  );
};

export default AddSubtaskDialog;
