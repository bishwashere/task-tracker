import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentLoading() {

  return (
    <div className="wrapper flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-48 mx-auto" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-5 w-64" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}

