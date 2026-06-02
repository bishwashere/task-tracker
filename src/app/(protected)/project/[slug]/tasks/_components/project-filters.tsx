"use client";

import React, { useState } from "react";
import { Filter } from "lucide-react";
import { ProjectContextType, useProjectContext } from "../_context";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  hideUserFilter: boolean;
  members: { name: string | null; id: string }[];
  toolbarExtra?: React.ReactNode;
};

type StatusFilterProps = {
  tabs: readonly string[];
  tab: string;
  setTab: (tab: ProjectContextType["tab"]) => void;
  className?: string;
};

const StatusFilterButtons = ({
  tabs,
  tab,
  setTab,
  className = "",
}: StatusFilterProps) => (
  <div className={`flex items-center gap-2 flex-wrap ${className}`}>
    {tabs.map((filter) => (
      <button
        key={filter}
        type="button"
        className={`capitalize px-4 py-2 text-sm rounded ${
          tab === filter
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => setTab(filter as ProjectContextType["tab"])}
      >
        {filter}
      </button>
    ))}
  </div>
);

type UserFilterProps = {
  members: { name: string | null; id: string }[];
  userFilter: string;
  setUserFilter: (value: string) => void;
  className?: string;
};

const UserFilterSelect = ({
  members,
  userFilter,
  setUserFilter,
  className = "",
}: UserFilterProps) => (
  <select
    className={`border rounded px-2 py-1 text-sm w-full sm:w-auto ${className}`}
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
);

type SubtaskToggleProps = {
  showSubtasks: boolean;
  setShowSubtasks: React.Dispatch<React.SetStateAction<boolean>>;
};

const SubtaskToggle = ({ showSubtasks, setShowSubtasks }: SubtaskToggleProps) => (
  <button
    type="button"
    className="cursor-pointer text-left text-blue-500 hover:underline w-fit text-sm sm:text-base"
    onClick={() => setShowSubtasks((prev) => !prev)}
  >
    {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
  </button>
);

type DateFilterSelectProps = {
  dateFilters: ProjectContextType["dateFilters"];
  filterByDate: ProjectContextType["filterByDate"];
  setFilterByDate: React.Dispatch<
    React.SetStateAction<ProjectContextType["filterByDate"]>
  >;
  className?: string;
};

const DateFilterSelect = ({
  dateFilters,
  filterByDate,
  setFilterByDate,
  className = "",
}: DateFilterSelectProps) => (
  <select
    className={`border rounded px-2 py-1 text-sm w-full sm:w-auto ${className}`}
    value={filterByDate}
    onChange={(e) => {
      setFilterByDate(e.target.value as ProjectContextType["filterByDate"]);
    }}
  >
    {dateFilters.map((filter) => (
      <option key={filter.value} value={filter.value}>
        {filter.label}
      </option>
    ))}
  </select>
);

const ProjectFilters = ({ hideUserFilter, members, toolbarExtra }: Props) => {
  const {
    tabs,
    setTab,
    tab,
    userFilter,
    setUserFilter,
    dateFilters,
    setFilterByDate,
    filterByDate,
    showSubtasks,
    setShowSubtasks,
  } = useProjectContext();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const showUserFilter = !hideUserFilter && members.length > 0;
  const hasActiveFilters =
    tab !== "all" ||
    userFilter !== "all" ||
    filterByDate !== "all" ||
    !showSubtasks;

  return (
    <>
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden sm:flex items-center gap-2.5 flex-wrap">
            <StatusFilterButtons tabs={tabs} tab={tab} setTab={setTab} />
            {showUserFilter && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <UserFilterSelect
                  members={members}
                  userFilter={userFilter}
                  setUserFilter={setUserFilter}
                />
              </>
            )}
          </div>

          <div className="sm:hidden">
            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className={`relative flex items-center justify-center rounded-md border p-2 ${
                    hasActiveFilters
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                  aria-label="Filters"
                >
                  <Filter className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-5 pt-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600">
                      Status
                    </p>
                    <StatusFilterButtons
                      tabs={tabs}
                      tab={tab}
                      setTab={setTab}
                    />
                  </div>
                  {showUserFilter && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-600">
                        Assignee
                      </p>
                      <UserFilterSelect
                        members={members}
                        userFilter={userFilter}
                        setUserFilter={setUserFilter}
                      />
                    </div>
                  )}
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600">
                      Subtasks
                    </p>
                    <SubtaskToggle
                      showSubtasks={showSubtasks}
                      setShowSubtasks={setShowSubtasks}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600">
                      Time range
                    </p>
                    <DateFilterSelect
                      dateFilters={dateFilters}
                      filterByDate={filterByDate}
                      setFilterByDate={setFilterByDate}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {toolbarExtra && (
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {toolbarExtra}
          </div>
        )}
      </div>
      <div className="mb-4 hidden sm:flex flex-row gap-4">
        <SubtaskToggle
          showSubtasks={showSubtasks}
          setShowSubtasks={setShowSubtasks}
        />
        <Separator orientation="vertical" className="h-5" />
        <DateFilterSelect
          dateFilters={dateFilters}
          filterByDate={filterByDate}
          setFilterByDate={setFilterByDate}
        />
      </div>
    </>
  );
};

export default ProjectFilters;
