import TaskGenerationLoader from '@/components/common/task-generation-loader';
import { useDeleteAiSuggestedTask, useSaveTask } from '@/queries/tasks/hooks';
import { AISuggestedTask } from '@prisma/client';
import { useParams } from 'next/navigation';
import React from 'react'

type Props = {
  loading: boolean;
  tasks: AISuggestedTask[]
  completed: () => void;
  showGenerationLoader?: boolean;
}

// todo initial loading is not showing properly
const AiSuggestions = ({ loading, completed, tasks, showGenerationLoader }: Props) => {
  const save = useSaveTask()
  const del = useDeleteAiSuggestedTask()
  const { id } = useParams() as { id: string }
  const [active, setActive] = React.useState([""])
  if (loading && showGenerationLoader)
    return (
      <TaskGenerationLoader
        onComplete={completed}
      />
    )

  if (tasks.length === 0) return null;

  return (
    <div className='flex flex-col gap-4'>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Maybe add these tasks?
        </h3>
        {tasks.map((task, i) => (
          <div
            key={i}
            className="mb-4 p-4 rounded bg-gray-50 border border-gray-200 relative flex justify-between"
          >
            <div>
              <h4 className="font-semibold">{task.name}</h4>
            </div>
            <div className="flex gap-2">
              <button
                disabled={(save.isPending || del.isPending) && active.includes(task.id)}
                className="bg-green-500 text-white px-2 py-1 rounded disabled:opacity-50"
                onClick={async () => {
                  setActive((prev) => [...prev, task.id])
                  try {
                    await save.mutateAsync({
                      projectId: id,
                      taskDescription: task.description || "",
                      taskTitle: task.name,
                    })
                    del.mutate(task.id)
                  } catch { }
                }}
              >
                ✓
              </button>
              <button
                disabled={(save.isPending || del.isPending) && active.includes(task.id)}
                className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                onClick={() => {
                  setActive((prev) => [...prev, task.id])
                  del.mutate(task.id)
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AiSuggestions