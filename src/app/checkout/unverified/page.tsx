import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentUnverifiedPage() {
  return (
    <div className="wrapper flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">
            We Could Not Verify Your Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Your payment status is uncertain. Please contact our support team for
          assistance.
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
