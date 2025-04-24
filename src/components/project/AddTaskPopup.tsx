import { IoMdClose } from "react-icons/io";
import Modal from "../Modal/Modal";
import FormSubmitButton from "../common/FormSubmitButton";
import { saveTask } from "@/actions/task";
import toast from "react-hot-toast";
import { TaskType } from "@/types/organization";

const AddTaskPopup = ({
  setTasks,
  projectId,
  modalIsOpen,
  setModalIsOpen,
}: {
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  projectId: string;
  modalIsOpen: boolean;
  setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const addTask = async (formData: FormData) => {
    const res = await saveTask(
      projectId,
      formData.get("taskTitle") as string,
      formData.get("taskDescription") as string,
    );
    if (res.success) {
      toast.success(res.message);
      setTasks((prevTasks) => [...prevTasks, res.task as TaskType]);
      setModalIsOpen(false);
    } else {
      toast.error(res.message);
    }
  };
  return (
    <Modal
      modalIsOpen={modalIsOpen}
      setModalIsOpen={setModalIsOpen}
      className="w-[100%] md:w-96 px-10 py-10"
    >
      <div className="w-full flex justify-between">
        <h3 className="text-2xl font-semibold">Add Task</h3>
        <button
          onClick={() => setModalIsOpen(false)}
          className="cursor-pointer"
        >
          <IoMdClose className="text-2xl" />
        </button>
      </div>
      {/* <hr className='border border-gray-300 my-6' /> */}
      <form className="mt-8" action={addTask}>
        <input
          type="text"
          placeholder="Task Title"
          name="taskTitle"
          id="taskTitle"
          className="border p-2 rounded w-full mb-4"
          required
        />
        <textarea
          placeholder="Task Description"
          name="taskDescription"
          id="taskDescription"
          className="border p-2 rounded w-full h-24 mb-4"
        />
        <div className="flex justify-end mt-5">
          <FormSubmitButton className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
            Add Task
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
  );
};

export default AddTaskPopup;
