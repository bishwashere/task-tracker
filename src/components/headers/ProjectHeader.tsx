import { Session } from 'next-auth';
import React from 'react';
import ProfileMenu from '../common/ProfileMenu';

export const ProjectHeader = ({ session, projectName }: { session: Session; projectName: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Project: {projectName}</h1>
    <ProfileMenu session={session} showSettings={false}/>
  </div>
);
