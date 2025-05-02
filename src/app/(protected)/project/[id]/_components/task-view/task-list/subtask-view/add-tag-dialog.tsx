import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useSaveSubtaskTag } from "@/queries/subtask/hooks";

const AddTagPopup = ({
  taskId,
  subtaskId,
  projectId,
}: {
  taskId: string;
  subtaskId: string;
  projectId: string;
}) => {
  const [tagColor, setTagColor] = useState("#FFFFFF");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    tagName: "",
  });
  const save = useSaveSubtaskTag()
  const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

  const submitTag = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      save.mutate({
        projectId,
        subtaskId,
        tagColor,
        tagName: formData.tagName,
        taskId,
      })
      setModalIsOpen(false);
    } catch { }
  };

  return (
    <>
      <Dialog
        open={modalIsOpen}
        onOpenChange={setModalIsOpen}
      >
        <DialogTrigger asChild>
          <button
            className="text-sm text-blue-300 hover:underline"
          >
            +Tag
          </button>
        </DialogTrigger>
        <DialogContent
          className="w-[100%] md:w-96 px-10 py-10"

        >
          <div className="w-full flex ">
            <h3 className="text-2xl font-semibold">Add Tag</h3>
          </div>
          {/* <hr className='border border-gray-300 my-6' /> */}
          <form className="mt-8" onSubmit={submitTag}>
            <label className="block mb-2">
              Tag Name:
              <input
                type="text"
                id="tagName"
                name="tagName"
                className="w-full border p-2 rounded mt-1"
                required
                value={formData.tagName}
                onChange={(e) =>
                  setFormData({ ...formData, tagName: e.target.value })
                }
              />
            </label>
            <label className="block mb-4">
              Tag Color:
              <div className="flex items-center gap-2 mt-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded ${tagColor === color ? "ring-2 ring-black" : ""}`}
                    onClick={() => setTagColor(color)}
                  />
                ))}
              </div>
            </label>
            <div className="flex justify-end mt-5">
              <Button
                loading={save.isPending}
                variant={"blue"} className="mr-2">
                Save
              </Button>
              <Button
                type="reset"
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

export default AddTagPopup;
