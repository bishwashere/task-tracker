import { IoMdClose } from "react-icons/io"
import Modal from "../Modal/Modal"
import FormSubmitButton from "../common/FormSubmitButton"
import { saveTaskTag } from "@/actions/task"
import toast from "react-hot-toast"
import { SubtaskType, TaskType } from "@/types/organization"
import { useState } from "react"

const AddTagPopup = ({ setTasks, taskId, subtaskId, projectId }: { setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>; taskId: string; subtaskId: string; projectId: string; }) => {

  const [tagColor, setTagColor] = useState('#FFFFFF');
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  const submitTag = async (formData: FormData) => {
    const tagName = formData.get('tagName') as string;
    const res = await saveTaskTag(subtaskId, projectId, tagName, tagColor);
    if (res.success) {
      toast.success(res.message);
      const updatedSubtask = res.updatedSubtask as SubtaskType
      setTasks((prevTasks) =>
         prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === updatedSubtask.id ? updatedSubtask : subtask
                ),
              }
            : task
        )
      );
      setModalIsOpen(false);
    }
    else {
      toast.error(res.message);
    }
  }

  return (
    <>
      <button
        onClick={() => setModalIsOpen(true)}
        className="text-sm text-blue-300 hover:underline"
      >
        +Tag
      </button>

      <Modal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} className="w-[100%] md:w-96 px-10 py-10">
        <div className="w-full flex justify-between">
          <h3 className="text-2xl font-semibold">Add Tag</h3>
          <button onClick={() => setModalIsOpen(false)} className="cursor-pointer">
            <IoMdClose className="text-2xl" />
          </button>
        </div>
        {/* <hr className='border border-gray-300 my-6' /> */}
        <form className="mt-8" action={submitTag}>
          <label className="block mb-2">
            Tag Name:
            <input
              type="text"
              id="tagName"
              name="tagName"
              className="w-full border p-2 rounded mt-1"
              required
            />
          </label>
          <label className="block mb-4">
            Tag Color:
            <div className="flex items-center gap-2 mt-2">
              {colors.map((color) => (
                <div
                  key={color}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded ${tagColor === color ? 'ring-2 ring-black' : ''}`}
                  onClick={() => setTagColor(color)}
                />
              ))}
            </div>
          </label>
          <div className="flex justify-end mt-5">
            <FormSubmitButton
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
              Save
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
  )
}

export default AddTagPopup;