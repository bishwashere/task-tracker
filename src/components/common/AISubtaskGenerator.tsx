"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAISuggestedSubtasks } from "@/actions/ai-sugested-task";
import { saveSubTask } from "@/actions/task";
import toast from "react-hot-toast";
import { SubtaskType } from "@/types/organization";
import TaskGenerationLoader from "./task-generation-loader";

type Task = {
  id: number;
  content: string;
  selected: boolean;
};

type Props = {
  taskId: string;
  projectId: string;
  onSubtaskAdded?: (subtasks: SubtaskType[]) => void;
};

export default function AISubtaskDialog({
  taskId,
  projectId,
  onSubtaskAdded,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const generateTasks = async () => {
    setIsGenerating(true);
    setIsMockLoading(true);
    const generatedTasks = await getAISuggestedSubtasks(taskId);
    setTasks(
      generatedTasks.subtasks?.map((task, i) => ({
        content: task,
        selected: false,
        id: i,
      })) || [],
    );
    setIsGenerating(false);
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, selected: !task.selected } : task,
      ),
    );
  };

  const saveTasks = async () => {
    const selectedTasks = tasks.filter((task) => task.selected);

    const res = await Promise.all(
      selectedTasks.map((task) =>
        saveSubTask(taskId, projectId, task.content, new Date(), 1),
      ),
    );
    setOpen(false);
    toast.success("Subtasks added successfully!");
    onSubtaskAdded?.(res.map((task) => task.subTask as unknown as SubtaskType));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2.5 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add subtask with AI"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate subtask with the help of AI</DialogTitle>
          <DialogDescription>
            Let AI suggest subtasks for your project. Select the ones you want
            to add.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {tasks.length === 0 || isMockLoading || isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              {isGenerating ||
                (isMockLoading && (
                  <TaskGenerationLoader
                    onComplete={() => setIsMockLoading(false)}
                  />
                ))}
              <button
                onClick={generateTasks}
                disabled={isGenerating || isMockLoading}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating || isMockLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Suggested subtasks:
              </h3>
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`flex items-center justify-between rounded-md border p-3 ${task.selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                      }`}
                  >
                    <span className="text-sm text-gray-700">
                      {task.content}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${task.selected
                            ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        aria-label={
                          task.selected ? "Deselect task" : "Select task"
                        }
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${!task.selected
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        aria-label={
                          !task.selected ? "Reject task" : "Unmark as rejected"
                        }
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.currentTarget.disabled = true;
                    e.currentTarget.classList.add("opacity-50");
                    e.currentTarget.innerText = "Adding...";
                    saveTasks();
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add Selected ({tasks.filter((t) => t.selected).length})
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
