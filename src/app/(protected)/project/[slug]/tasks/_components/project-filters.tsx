import React from "react";
import { ProjectContextType, useProjectContext } from "../_context";
import { Separator } from "@/components/ui/separator";

type Props = {
  hideUserFilter: boolean;
  members: { name: string | null; id: string }[];
  toolbarExtra?: React.ReactNode;
};

const ProjectFilters = ({ hideUserFilter, members, toolbarExtra }: Props) => {
  const { tabs, setTab, tab, userFilter, setUserFilter, dateFilters, setFilterByDate, filterByDate, showSubtasks, setShowSubtasks } = useProjectContext();
  return (
    <>
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex justify-start items-center max-sm:space-x-2 space-x-4 ">
          {tabs.map((filter) => (
            <button
              key={filter}
              className={`sm:px-4 capitalize px-2 text-sm sm:py-2 py-0.5 rounded ${tab === filter
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
              onClick={() => setTab(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* filter by assigned users */}
        {
          // only if admin
          !hideUserFilter && members.length > 0 && (
            <>
              {" "}
              <Separator orientation="vertical" className="h-5" />
              <select
                className="border rounded px-2 py-1 text-sm"
                value={userFilter || ""}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="unassigned">Unassigned</option>
                {members.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || "Unknown User"}
                  </option>
                ))}
              </select>
            </>
          )
        }
        </div>

        {toolbarExtra && (
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {toolbarExtra}
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-row gap-4">
        <p
          className="cursor-pointer text-blue-500 hover:underline w-fit text-sm sm:text-base"
          onClick={() => setShowSubtasks((prev) => !prev)}
        >
          {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
        </p>
        <Separator orientation="vertical" className="h-5" />
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filterByDate}
          onChange={(e) => {
            setFilterByDate(e.target.value as ProjectContextType["filterByDate"]);
          }}
        >
          {
            dateFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))
          }
        </select>
      </div >
    </>
  );
};

export default ProjectFilters;
