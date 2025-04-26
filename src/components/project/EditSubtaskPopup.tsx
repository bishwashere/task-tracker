import { IoMdClose } from "react-icons/io";
import Modal from "../Modal/Modal";
import FormSubmitButton from "../common/FormSubmitButton";
import { editSubTask } from "@/actions/task";
import toast from "react-hot-toast";
import { useState } from "react";
import { SubtaskType, TaskType } from "@/types/organization";
import { BiEditAlt } from "react-icons/bi";
import { User } from "@/types/user";

const EditSubtaskPopup = ({
  users,
  subtask,
  setTasks,
  taskId,
  projectId,
}: {
  users: User[];
  subtask: SubtaskType;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  taskId: string;
  projectId: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const edit = async (formData: FormData) => {
    const subTaskName = formData.get("subtaskName") as string;
    const dueDate = new Date(formData.get("dueDate") as string);
    const points = Number(formData.get("points") as string);
    const assignedUserId = formData.get("assignedUserId") as string;
    // console.log(subTaskName, dueDate, points, assignedUserId)
    const res = await editSubTask(
      taskId,
      projectId,
      subtask.id,
      subTaskName,
      dueDate,
      points,
      assignedUserId,
    );
    if (res.success) {
      toast.success(res.message);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
              ...task,
              subtasks: task.subtasks.some(
                (sub) => sub.id === res.subTask?.id,
              )
                ? task.subtasks.map((sub) =>
                  sub.id === res.subTask?.id
                    ? (res.subTask as unknown as SubtaskType)
                    : sub,
                )
                : [...task.subtasks, res.subTask as unknown as SubtaskType],
            }
            : task,
        ),
      );
      setModalIsOpen(false);
    } else {
      toast.error(res.message);
    }
  };
  return (
    <>
      <button className="p-1" onClick={() => setModalIsOpen(true)}>
        <BiEditAlt className="text-red-600" />
    </button >
      <Modal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        className="w-[100%] md:w-[26rem] px-10 py-10 text-black"
      >
        <div className="w-full flex justify-between">
          <h3 className="text-2xl font-semibold">Edit Subtask</h3>
          <button
            onClick={() => setModalIsOpen(false)}
            className="cursor-pointer"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <form className="mt-8" action={edit}>
          <input
            type="text"
            placeholder="Subtask Name"
            name="subtaskName"
            id="subtaskName"
            defaultValue={subtask.name}
            // value={subtaskName}
            // onChange={(e) => setSubtaskName(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            required
          />
          <input
            type="date"
            placeholder="Due Date"
            id="dueDate"
            name="dueDate"
            defaultValue={
              subtask.dueDate
                ? new Date(subtask.dueDate).toISOString().split("T")[0]
                : undefined
            }
            // value={dueDate}
            // onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="number"
            placeholder="Points"
            id="points"
            name="points"
            defaultValue={subtask.points}
            min={1}
            // value={points}
            // onChange={(e) => setPoints(parseInt(e.target.value, 10))}
            className="border p-2 rounded w-full mb-4"
            required
          />
          <select
            defaultValue={subtask.assignedUserId || ""}
            id="assignedUserId"
            name="assignedUserId"
            className="border p-2 rounded w-full mb-4"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <div className="flex justify-end mt-5">
            <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              Edit Subtask
            </FormSubmitButton>
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditSubtaskPopup;
