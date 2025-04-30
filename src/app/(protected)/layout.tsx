"use server"
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async (props: Props) => {
  const session = await auth();
  if (!session) redirect("/login");
  return props.children
}

export default Layout