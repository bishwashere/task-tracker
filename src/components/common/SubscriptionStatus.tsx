import { getUserSubscription } from '@/actions/subscription'
import { useFetch } from '@/hooks/useFetch'
import { ErrorBoundaryHandler } from 'next/dist/client/components/error-boundary'
import React from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/cn'

const SubscriptionStatus = () => {
  const { data, loading } = useFetch(getUserSubscription)
  return (
    <Button size={"sm"} loading={loading} variant={"outline"} className={cn(data?.status === "trialing" ? "border-destructive text-destructive" : "", "capitalize")}>
      {data?.status}
    </Button>
  )
}

export default SubscriptionStatus

