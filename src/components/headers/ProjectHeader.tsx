import React from 'react';

export const ProjectHeader = ({ projectName }: { projectName: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Project: {projectName}</h1>
    {/* <ProfileMenu /> */}
  </div>
);
