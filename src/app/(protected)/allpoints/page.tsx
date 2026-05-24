"use client"
import SuperHeader from '@/components/common/block/super-header'
import ProfileMenu from '@/components/common/profile-menu'
import { buttonVariants } from '@/components/ui/button'
import Loading from '@/components/ui/loading'
import { useDashboardContext } from '@/context/dashboard-context'
import { useAppRole } from '@/context/view-as-context'
import { useGetPoints } from '@/queries/points/hooks'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Page = () => {
  const { selectedOrg } = useDashboardContext()
  const appRole = useAppRole()
  const router = useRouter()
  const [points, setPoints] = useState(0)
  if (!selectedOrg) {
    return <Loading />
  }


  if (appRole !== "admin") return (
    <div
      className='flex flex-col items-center justify-center h-screen text-xl'
    >Not Allowed</div>
  )
  return (
    <>
      <SuperHeader
        onBackClick={() => router.back()}
      />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Points  </h1>
          <ProfileMenu showSettings={false} />
        </div>
        <div
          className='flex flex-col items-center justify-center max-w-[800px] p-4 mt-6 sm:mt-12 rounded-lg w-full mx-auto'
        >
          <div
            className='flex flex-col gap-4 mt-6  w-full'
          >
            {
              selectedOrg?.organization?.members?.map((member) => (
                <Comp key={member.user.id} user={member.user.id} />
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Page

const Comp = ({ user }: { user: string }) => {
  const { data, isLoading } = useGetPoints(user)

  if (!data || isLoading) return null;

  return (
    <div
      className='flex justify-between gap-4 border w-full p-2 font-bold items-center'
    >
      <div className='col-span-2 '>
        {data?.user?.name}
      </div>
      <div>
        {data?.points?.reduce((total, point) => total + point.points, 0)}
      </div>
      <div>
        <Link
          className={buttonVariants({ variant: "blue", size: "sm" })}
          href={`/points?user=${user}`}
        >
          View All
        </Link>
      </div>
    </div>
  )
}