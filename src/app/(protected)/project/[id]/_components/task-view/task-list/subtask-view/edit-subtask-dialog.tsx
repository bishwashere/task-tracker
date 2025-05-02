import { useGetProjectById } from "@/queries/project/hooks";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { BiEditAlt } from "react-icons/bi";
import { useEditSubtask } from "@/queries/subtask/hooks";

const EditSubtaskDialog = ({
  subtaskId,
  projectId,
  defaultValue,
  taskId,
}: {
  subtaskId: string;
  projectId: string;
  taskId: string;
  defaultValue: {
    subtaskName: string;
    dueDate: string;
    points: number;
    assignedUserId: string;
  }
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    subtaskName: defaultValue?.subtaskName || "",
    dueDate: defaultValue?.dueDate || "",
    points: defaultValue?.points || 1,
    assignedUserId: defaultValue?.assignedUserId || "",
  });
  const edit = useEditSubtask()
  const { data } = useGetProjectById(projectId);

  useEffect(() => {
    setFormData({
      subtaskName: defaultValue?.subtaskName || "",
      dueDate: defaultValue?.dueDate || "",
      points: defaultValue?.points || 1,
      assignedUserId: defaultValue?.assignedUserId || "",
    });
  }, [defaultValue]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.subtaskName.trim()) return;
    try {
      await edit.mutateAsync({
        projectId,
        subTaskName: formData.subtaskName,
        dueDate: new Date(formData.dueDate),
        points: formData.points,
        assignedUserId: formData.assignedUserId,
        taskId,
        subTaskId: subtaskId,
      })
      setModalIsOpen(false);
      setFormData({ subtaskName: "", dueDate: "", points: 1, assignedUserId: "" });
    } catch { }
  };

  return (
    <Dialog
      open={modalIsOpen}
      onOpenChange={setModalIsOpen}
    >
      <DialogTrigger asChild>
        <button className="p-1" onClick={() => setModalIsOpen(true)}>
          <BiEditAlt className="text-red-600" />
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
              loading={edit.isPending}
              variant={"blue"} className=" mr-2">
              Edit Subtask
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
  );
};

export default EditSubtaskDialog;
