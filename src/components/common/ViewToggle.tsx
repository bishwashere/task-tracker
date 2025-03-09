import React, { useState, useEffect } from 'react';
import { ListIcon, ColumnsIcon } from '@/components/common/Icons';

export const ViewToggle = ({ onChange }: {onChange: (mode: string) => void;}) => {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('viewMode') || 'list';
    }
    return 'list';
  });

  const toggleViewMode = (mode:string) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', mode);
    }
    onChange(mode);
  };

  useEffect(() => {
    onChange(viewMode);
  }, [viewMode, onChange]);

  return (
    <div className="flex justify-end items-center space-x-4">
      <button onClick={() => toggleViewMode('list')} title="List View">
        <ListIcon className={`w-6 h-6 ${viewMode === 'list' ? 'text-blue-500' : 'text-gray-400'}`} />
      </button>
      <button onClick={() => toggleViewMode('grid')} title="Grid View">
        <ColumnsIcon className={`w-6 h-6 ${viewMode === 'grid' ? 'text-blue-500' : 'text-gray-400'}`} />
      </button>
    </div>
  );
};
