import { IoMdClose } from "react-icons/io";
import Modal from "../Modal/Modal";
import FormSubmitButton from "../common/FormSubmitButton";
import { saveSubTask } from "@/actions/task";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { SubtaskType, TaskType } from "@/types/organization";
import AISubtaskDialog from "../common/AISubtaskGenerator";

const AddSubtask = ({
  setTasks,
  taskId,
  projectId,
  showText = true,
  showAi = true,
}: {
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  taskId: string;
  projectId: string;
  showText?: boolean;
  showAi: boolean;
}) => {
  const [showAiSuggestion, setShowAiSuggestion] = useState(showAi);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    setShowAiSuggestion(showAi);
  }, [showAi]);

  const addSubTask = async (formData: FormData) => {
    const subTaskName = formData.get("subtaskName") as string;
    const dueDate = new Date(formData.get("dueDate") as string);
    const points = Number(formData.get("points") as string);
    const res = await saveSubTask(
      taskId,
      projectId,
      subTaskName,
      dueDate,
      points,
    );
    if (res.success) {
      toast.success(res.message);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: [
                  ...task.subtasks,
                  res.subTask as unknown as SubtaskType,
                ],
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
    <div className="absolute top-2 right-2 space-x-2 flex">
      {showAiSuggestion && (
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
      )}
      <div
        className="flex flex-row items-center gap-2"
        onClick={() => setModalIsOpen(true)}
      >
        {showText && <p className="text-blue-600">Add Subtask</p>}
        <button className="bg-gray-500 text-white w-8 h-8 flex items-center justify-center rounded hover:bg-gray-600 z-10">
          +
        </button>
      </div>
      <Modal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        className="w-[100%] md:w-96 px-10 py-10"
      >
        <div className="w-full flex justify-between">
          <h3 className="text-2xl font-semibold">Add Subtask</h3>
          <button
            onClick={() => setModalIsOpen(false)}
            className="cursor-pointer"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <form className="mt-8" action={addSubTask}>
          <input
            type="text"
            placeholder="Subtask Name"
            name="subtaskName"
            id="subtaskName"
            // value={subtaskName}
            // onChange={(e) => setSubtaskName(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="date"
            placeholder="Due Date"
            id="dueDate"
            name="dueDate"
            // value={dueDate}
            // onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <input
            type="number"
            placeholder="Points"
            id="points"
            name="points"
            defaultValue={1}
            min={1}
            // value={points}
            // onChange={(e) => setPoints(parseInt(e.target.value, 10))}
            className="border p-2 rounded w-full mb-4"
          />
          <div className="flex justify-end mt-5">
            <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              Add Subtask
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
    </div>
  );
};

export default AddSubtask;
