import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = React.ComponentProps<"div">

const Loading = ({ className, ...props }: Props) => {
  return (
    <div
      className={cn("h-[80vh] flex justify-center items-center text-lg", className)}
      {...props}
    >
      <Loader2 className="animate-spin size-5 mr-2" /> Loading...
    </div>
  )
}

export default Loading