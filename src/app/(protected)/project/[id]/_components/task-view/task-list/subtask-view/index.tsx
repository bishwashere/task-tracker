import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Subtask } from '@prisma/client';
import React from 'react'
import { useProjectContext } from '../../../../_context';
import { SubTaskContent } from './subtask-content';
import { useTaskListContext } from '../context';

export interface SubTaskViewProps {
  subtask: Subtask & {
    subtaskSortIndex: { sortIndex: number }[]
    assignedUser: {
      name: string | null
      image: string | null
    } | null
    issueCount: number;
  };
  isNew: (createdAt: string | Date) => boolean;
  taskId: string;
}


const SubTaskView = (props: SubTaskViewProps) => {
  const { editMode } = useProjectContext()
  const { activeDragging } = useTaskListContext()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.subtask.id,
    data: {
      ...props.subtask,
      isSubtask: true, //! Important: This flags it as a subtask
    },
    disabled: editMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      {...(activeDragging?.type === "task" ? {} : {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
      })}
      className="cursor-grab active:cursor-grabbing"
    >
      <SubTaskContent {...props} isDragging={isDragging} />
    </div>
  );
};


export default SubTaskView