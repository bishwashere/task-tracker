import React, { useState, useEffect } from "react";
import { ListIcon, ColumnsIcon } from "@/components/common/Icons";
import { useProjectContext } from "@/app/(protected)/project/[id]/_context";

export const ViewToggle = () => {
  const { viewMode, setViewMode } = useProjectContext()

  return (
    <div className="flex justify-end items-center space-x-4">
      <button onClick={() => setViewMode("list")} title="List View">
        <ListIcon
          className={`w-6 h-6 ${viewMode === "list" ? "text-blue-500" : "text-gray-400"}`}
        />
      </button>
      <button onClick={() => setViewMode("grid")} title="Grid View">
        <ColumnsIcon
          className={`w-6 h-6 ${viewMode === "grid" ? "text-blue-500" : "text-gray-400"}`}
        />
      </button>
    </div>
  );
};
