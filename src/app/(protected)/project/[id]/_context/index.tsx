"use client";
import { useGetProjectById } from "@/queries/project/hooks";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const tabs = ["all", "pending", "done"] as const;
const dateFilters = [{
  label: "All Time",
  value: "all",
},
{
  label: "Today",
  value: "today",
},
{
  label: "This Week",
  value: "week",
},
{
  label: "This Month",
  value: "month",
},
{
  label: "This Year",
  value: "year",
}] as const;

export type ProjectContextType = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  tab: (typeof tabs)[number];
  setTab: React.Dispatch<React.SetStateAction<(typeof tabs)[number]>>;
  tabs: typeof tabs;
  userFilter: string
  setUserFilter: React.Dispatch<React.SetStateAction<string>>;
  filterByDate: (typeof dateFilters)[number]["value"];
  setFilterByDate: React.Dispatch<React.SetStateAction<(typeof dateFilters)[number]["value"]>>;
  dateFilters: typeof dateFilters;
  showSubtasks: boolean;
  setShowSubtasks: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "list" | "grid";
  setViewMode: React.Dispatch<React.SetStateAction<"list" | "grid">>;
  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;

  filteredTasks: any;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { id } = useParams() as {
    id: string;
  };
  const { data, isPending } = useGetProjectById(id);
  const [editMode, setEditMode] =
    useState<ProjectContextType["editMode"]>(false);
  const [tab, setTab] = useState<ProjectContextType["tab"]>("pending");
  const [userFilter, setUserFilter] =
    useState<ProjectContextType["userFilter"]>("all");
  const [filterByDate, setFilterByDate] = useState<ProjectContextType["filterByDate"]>("all");
  const [showSubtasks, setShowSubtasks] = useState<ProjectContextType["showSubtasks"]>(true);
  const [viewMode, setViewMode] = useState<ProjectContextType["viewMode"]>("list");
  const [role, setRole] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(data?.tasks || [])

  useEffect(() => {
    if (isPending) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isToday = (date: Date) => {
      return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
    };

    const isSameWeek = (date: Date) => {
      const taskWeek = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
      const currentWeek = Math.ceil((today.getDate() + new Date(today.getFullYear(), today.getMonth(), 1).getDay()) / 7);
      return date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear() &&
        taskWeek === currentWeek;
    };

    const isSameMonth = (date: Date) => {
      return date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    const isSameYear = (date: Date) => {
      return date.getFullYear() === today.getFullYear();
    };

    // Apply all filters to tasks
    const filteredTasks = data?.tasks?.map(task => {
      if (!task) return task;

      // Special cases where we want to keep tasks with no subtasks
      const isEmptyTask = task.subtasks.length === 0;
      const showEmptyTask = (
        (tab === "all") &&
        (userFilter === "all" || userFilter === "unassigned") &&
        filterByDate === "all"
      );

      if (isEmptyTask && showEmptyTask) {
        return task;
      }

      return {
        ...task,
        subtasks: task.subtasks.filter(subtask => {
          // First apply user filter
          const passesUserFilter =
            userFilter === "all" ? true :
              userFilter === "unassigned" ? !subtask.assignedUserId :
                subtask.assignedUserId === userFilter;

          if (!passesUserFilter) return false;

          // Then apply date filter if not "all"
          if (filterByDate === "all") return true;

          if (!subtask.dueDate) return false;

          const subtaskDate = new Date(subtask.dueDate);
          if (isNaN(subtaskDate.getTime())) return false;

          subtaskDate.setHours(0, 0, 0, 0);

          switch (filterByDate) {
            case "today":
              return isToday(subtaskDate);
            case "week":
              return isSameWeek(subtaskDate);
            case "month":
              return isSameMonth(subtaskDate);
            case "year":
              return isSameYear(subtaskDate);
            default:
              return false;
          }
        })
      };
    }).filter(task => {
      if (!task) return false;

      // Keep tasks with no subtasks in the specified cases
      const isEmptyTask = task.subtasks.length === 0;
      const showEmptyTask = (
        (tab === "all") &&
        (userFilter === "all" || userFilter === "unassigned") &&
        filterByDate === "all"
      );

      if (isEmptyTask && showEmptyTask) {
        return true;
      }

      return task.subtasks.length > 0;
    });

    // Apply tab filter (all, pending, done)
    const filteredByTab = filteredTasks?.map(task => {
      // Keep empty tasks as is in the specified cases
      const isEmptyTask = task.subtasks.length === 0;
      const showEmptyTask = (
        (tab === "all") &&
        (userFilter === "all" || userFilter === "unassigned") &&
        filterByDate === "all"
      );

      if (isEmptyTask && showEmptyTask) return task;

      if (tab === "all") return task;
      if (tab === "done") return {
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.status === "done")
      };
      if (tab === "pending") return {
        ...task,
        subtasks: task.subtasks.filter(subtask => subtask.status === "pending")
      };
    }).filter(task => {
      if (!task) return false;

      // Keep empty tasks in the specified cases
      const isEmptyTask = task.subtasks.length === 0;
      const showEmptyTask = (
        (tab === "all") &&
        (userFilter === "all" || userFilter === "unassigned") &&
        filterByDate === "all"
      );

      if (isEmptyTask && showEmptyTask) return true;

      if (tab === "done" && task.subtasks.length === 0) return false;
      if (tab === "pending" && task.subtasks.length === 0) return false;
      return true;
    }) || [];

    setFilteredTasks(filteredByTab?.filter(task => task !== undefined));
  }, [data?.tasks, isPending, tab, userFilter, filterByDate]);



  // load initial state from local storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedViewMode = localStorage.getItem("viewMode");
    if (storedViewMode) {
      setViewMode(storedViewMode as "list" | "grid");
    }
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        editMode,
        setEditMode,
        setTab,
        tab,
        tabs,
        userFilter,
        setUserFilter,
        filterByDate,
        setFilterByDate,
        dateFilters,
        showSubtasks,
        setShowSubtasks,
        viewMode,
        setViewMode,
        role,
        setRole,
        filteredTasks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error(
      "useProjectContext must be used within a ProjectContextProvider",
    );
  }
  return context;
};



