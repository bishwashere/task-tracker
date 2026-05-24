import React, { useState } from 'react'
import { TaskListContextProvider, TaskListProps, useTaskListContext } from './context'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskDragOverlay from './task-drag-overlay';
import SortableTaskItem from './sortable-task-item';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Project } from '@prisma/client';
import { sortSubtasks } from '@/queries/subtask/action';
import { sortTasks } from '@/queries/tasks/actions';
import { useProjectContext } from '../../../_context';

type Props = TaskListProps

const TaskList = (props: Props) => {

  return (
    <TaskListContextProvider {...props}>
      <Comp {...props} />
    </TaskListContextProvider>
  )
}

const Comp = (props: Props) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const { setActiveDragging } = useTaskListContext()
  const queryClient = useQueryClient()
  const { slug, showSubtasks, setShowSubtasks } = useProjectContext()
  const handleDragStart = (event: DragStartEvent) => {
    const isSubtask = event.active.data.current?.isSubtask;
    // if (!isSubtask) {
    //   setWasSubTaskVisible(showSubtasks)
    //   setShowSubtasks(false)
    // }
    setActiveDragging({
      type: isSubtask ? 'subtask' : 'task',
      id: event.active.id as string,
    })
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragging(null);

    if (!over) return;

    const isSubtask = active.data.current?.isSubtask;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (isSubtask) {
      // Handle subtask reordering
      const task = props.tasks.find(t =>
        t.subtasks.some(s => s.id === activeId)
      );
      if (!task) return;

      const oldIndex = task.subtasks.findIndex(s => s.id === activeId);
      const newIndex = task.subtasks.findIndex(s => s.id === overId);

      const updatedSubtasks = arrayMove(task.subtasks, oldIndex, newIndex).map(
        (subtask, index) => ({
          ...subtask,
          subtaskSortIndex: [{ sortIndex: task.subtasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      // Update tasks state with new subtask order
      const updatedTasks = props.tasks.map(t =>
        t.id === task.id
          ? { ...t, subtasks: updatedSubtasks }
          : t
      );

      // Save previous state for rollback
      const prevTasks = props.tasks;
      queryClient.setQueryData(["project", slug], (oldData: Project | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: updatedTasks
        };
      });

      // Prepare sort data for backend
      const sortData = updatedSubtasks.map(subtask => ({
        subtaskId: subtask.id,
        sortIndex: subtask.subtaskSortIndex[0].sortIndex
      }));

      try {
        const res = await sortSubtasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
        }
      } catch {
        toast.error("An error occurred");
        queryClient.setQueryData(["project", slug], (oldData: Project | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            tasks: prevTasks
          };
        });
      }
    } else {
      // setShowSubtasks(wasSubTaskVisible)
      // Handle task reordering (your existing task reordering logic)
      const oldIndex = props.tasks.findIndex(task => task.id === activeId);
      const newIndex = props.tasks.findIndex(task => task.id === overId);

      const updatedTasks = arrayMove(props.tasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          taskSortIndex: [{ sortIndex: props.tasks.length - 1 - index }] as [
            { sortIndex: number }
          ],
        })
      );

      const prev = props.tasks;
      queryClient.setQueryData(["project", slug], (oldData: Project | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: updatedTasks
        };
      });

      const sortData = updatedTasks.map(task => ({
        taskId: task.id,
        sortIndex: task.taskSortIndex[0].sortIndex
      }));

      try {
        const res = await sortTasks(sortData);
        if (!res.success) {
          toast.error(res.message || "An error occurred");
          queryClient.setQueryData(["project", slug], (oldData: Project | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              tasks: prev
            };
          });
        }
      } catch {
        toast.error("An error occurred");
      }
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={[
          ...props.tasks.map((t) => t.id),
          ...props.tasks.flatMap((t) => t.subtasks.map((s) => s.id)),
        ]}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {props.tasks
            .sort(
              (a, b) =>
                (b?.taskSortIndex?.[0]?.sortIndex || 0) -
                (a?.taskSortIndex?.[0]?.sortIndex || 0),
            )
            .map((task, index) => (
              <SortableTaskItem key={task?.id}
                //@ts-expect-error:.........
                task={task}
                index={index} />
            ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {<TaskDragOverlay />}
      </DragOverlay>
    </DndContext>
  )
}

export default TaskList


