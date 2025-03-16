import { Session } from 'next-auth';
import React from 'react';
import ProfileMenu from '../common/ProfileMenu';
import { HiCurrencyDollar } from "react-icons/hi2";
import Link from 'next/link';

export const  ProjectHeader = ({ session, projectName, projectId, points, showPoints=false }: { session: Session; projectName: string; projectId?:string; points?: number; showPoints?: boolean }) => {
  return(
  <div className="flex justify-between items-center mb-5">
    <h1 className="text-2xl font-bold">Project: {projectName}</h1>
    <div className='flex flex-row justify-center items-center gap-5'>
      {showPoints && projectId && <Link href={`/points?fromProject=${projectId}`} className='flex flex-row justify-center items-center gap-1'>
        <HiCurrencyDollar className='text-3xl text-[#fbbc05]'/>
        <p className='text-xl mt-[2px]'>{points}</p>
      </Link>}
      <ProfileMenu session={session} showSettings={false}/>
    </div>
  </div>
)};
