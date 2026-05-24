import { Subtask, Task, TaskSortIndex } from "@prisma/client"
import { createContext, useContext, useState } from "react"

export type TaskListProps = {
  tasks: Array<Task & {
    subtasks: Array<Subtask & { subtaskSortIndex: { sortIndex: number }[] }>
    taskSortIndex: { sortIndex: number }[]
  }>

}

type TaskListContext = TaskListProps & {
  activeDragging: {
    type: "task" | "subtask"
    id: string
  } | null
  setActiveDragging: React.Dispatch<React.SetStateAction<TaskListContext["activeDragging"]>>
}

const Context = createContext<TaskListContext | null>(null)

export const TaskListContextProvider = ({ children, tasks }: { children: React.ReactNode } & TaskListProps) => {
  const [activeDragging, setActiveDragging] = useState<TaskListContext["activeDragging"]>(null)
  return (
    <Context.Provider value={{ tasks, activeDragging, setActiveDragging }}>
      {children}
    </Context.Provider>
  )
}

export const useTaskListContext = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error("useTaskListContext must be used within a TaskListContextProvider")
  }
  return context
}
