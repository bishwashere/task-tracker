import { IoMdClose } from "react-icons/io";
import Modal from "../Modal/Modal";
import FormSubmitButton from "../common/FormSubmitButton";
import { editTask } from "@/actions/task";
import toast from "react-hot-toast";
import { TaskType } from "@/types/organization";
import { BiEditAlt } from "react-icons/bi";
import { useState } from "react";

const EditTaskPopup = ({
  task,
  setTasks,
  projectId,
}: {
  task: TaskType;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  projectId: string;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const edit = async (formData: FormData) => {
    const res = await editTask(
      projectId,
      task.id,
      formData.get("taskTitle") as string,
      formData.get("taskDescription") as string,
    );
    if (res.success) {
      toast.success(res.message);
      setTasks((prevTasks) =>
        prevTasks.some((task) => task.id === res.task?.id)
          ? prevTasks.map((task) =>
              task.id === res.task?.id
                ? (res.task as unknown as TaskType)
                : task,
            )
          : [...prevTasks, res.task as unknown as TaskType],
      );
      setModalIsOpen(false);
    } else {
      toast.error(res.message);
    }
  };
  return (
    <>
      <button onClick={() => setModalIsOpen(true)} className="p-1">
        <BiEditAlt className="text-red-600" />
      </button>
      <Modal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        className="w-[100%] md:w-96 px-10 py-10"
      >
        <div className="w-full flex justify-between">
          <h3 className="text-2xl font-semibold">Edit Task</h3>
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
            placeholder="Task Title"
            defaultValue={task.name}
            name="taskTitle"
            id="taskTitle"
            className="border p-2 rounded w-full mb-4"
            required
          />
          <textarea
            placeholder="Task Description"
            defaultValue={task.description}
            name="taskDescription"
            id="taskDescription"
            className="border p-2 rounded w-full h-24 mb-4"
          />
          <div className="flex justify-end mt-5">
            <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              Edit Task
            </FormSubmitButton>
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
          {/* <hr className='border border-gray-300 my-6' /> */}
        </form>
      </Modal>
    </>
  );
};

export default EditTaskPopup;
