"use client";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import React from "react";
import PaymentLoading from "@/components/common/loading";
import { hasSession } from "@/actions/payment";

const Page = () => {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentSuccessPage />
    </Suspense>
  );
};

export default Page;

function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fn = async () => {
      if (!sessionId) {
        router.push("/checkout/unverified");
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
        return;
      }

      const session = await hasSession(sessionId as string);

      if (!session) {
        router.push("/checkout/unverified");
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
        return;
      }

      setIsLoading(false);
    };

    fn();
  }, [sessionId]);

  if (isLoading) return <PaymentLoading />;

  return (
    <div className="wrapper flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Your payment has been processed successfully.
        </CardContent>
        <CardFooter className="flex justify-center">
          <a href="/dashboard">
            <Button size="lg">Get Started</Button>
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
