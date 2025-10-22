"use client";
import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type SortOption = "manual" | "tasks-asc" | "tasks-desc" | "created-asc" | "created-desc";

interface ProjectSortDropdownProps {
  onSortChange: (sortOption: SortOption) => void;
  currentSort: SortOption;
}

const ProjectSortDropdown: React.FC<ProjectSortDropdownProps> = ({
  onSortChange,
  currentSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "manual" as SortOption, label: "Manual (Drag & Drop)" },
  ];

  const getCurrentLabel = () => {
    return sortOptions.find(option => option.value === currentSort)?.label || "Sort by...";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span>{getCurrentLabel()}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    currentSort === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectSortDropdown;
