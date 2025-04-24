import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentFailedPage() {
  return (
    <div className="wrapper flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Failed or Canceled</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          We couldn&apos;t process your payment or it was canceled.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/support">
            {" "}
            <Button size="lg">Contact Support</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
