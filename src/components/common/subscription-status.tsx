"use client";
import { getUserSubscription } from "@/actions/subscription";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/cn";
import {
  getPeriodEnd,
  hasPaidAccess,
  isSubscriptionExpired,
} from "@/lib/sub";
import { Dialog, DialogContent } from "../ui/dialog";
import PLANS from "@/constants/plans";
import PricingCards from "./pricing-cards";
import { createCustomerPortal, createStripeSession } from "@/actions/payment";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar1Icon, CreditCardIcon, ShieldCheckIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { MdSubscriptions } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

const SubscriptionStatus = () => {
  const { data, isLoading } = useQuery({
    queryFn: getUserSubscription,
    queryKey: ["subscription"],
    staleTime: 0,
    refetchOnMount: "always",
  });
  const [isSubModalOpen, setIsSubModalOpen] = React.useState(false);
  const router = useRouter();
  const periodEnd = getPeriodEnd(data);
  const { isExpired } = isSubscriptionExpired(periodEnd);
  const isPaid = hasPaidAccess(data);
  const isBlocking = isExpired && !isPaid;

  useEffect(() => {
    if (isLoading) return;

    if (isPaid) {
      setIsSubModalOpen(false);
      return;
    }

    if (isExpired) {
      setIsSubModalOpen(true);
      return;
    }

    if (data?.status === "trial") {
      const lastModalShow = localStorage.getItem("lastModalShow");

      if (!lastModalShow) {
        localStorage.setItem("lastModalShow", new Date().toString());
        setIsSubModalOpen(true);
      } else if (
        new Date(lastModalShow).getTime() <
        new Date().getTime() - 24 * 60 * 60 * 1000
      ) {
        localStorage.setItem("lastModalShow", new Date().toString());
        setIsSubModalOpen(true);
      } else {
        setIsSubModalOpen(false);
      }
    }
  }, [data, isLoading, isExpired, isPaid]);

  return (
    <>
      <Button
        onClick={() => setIsSubModalOpen(true)}
        size={"sm"}
        loading={isLoading}
        variant={"outline"}
        className={cn(
          data?.status === "trial" ? "border-destructive text-destructive" : "",
          "capitalize",
        )}
      >
        {data?.status === "trial" ? data.status : "Manage Subscription"}
      </Button>
      <Dialog
        open={isSubModalOpen}
        onOpenChange={(open) => {
          if (isBlocking && !open) return;
          setIsSubModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto max-sm:h-full">
          {data?.status === "trial" ? (
            <>
              <PricingCards
                desc={
                  isExpired
                    ? "Your free trial has expired. Upgrade to access more features !"
                    : data?.status === "trial"
                      ? "You are currently on the free trial plan. Upgrade to access more features !"
                      : undefined
                }
                header={isExpired ? "Upgrade Now" : "Upgrade to access more..."}
                onSelectPlan={async (pkg) => {
                  const res = await createStripeSession(pkg);
                  if (res) router.push(res);
                }}
                plans={PLANS}
              />
              {data?.status === "trial" && !isExpired && (
                  <button
                    className="text-black px-4 py-2 rounded underline"
                    onClick={() => setIsSubModalOpen(false)}
                  >
                    Continue with Free Trial!
                  </button>
                )}
            </>
          ) : (
            <div className="py-6 space-y-4 sm:space-y-8 max-w-5xl mx-auto pb-4 sm:pb-16">
              <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                <p className="text-muted-foreground">
                  Manage your subscription and view your billing history
                </p>
              </div>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Subscription</CardTitle>
                    <div className="flex gap-4 items-center">
                      <Badge
                        variant={
                          data?.status === "canceled"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {data?.status}
                      </Badge>
                      <Badge
                        variant={
                          isSubscriptionExpired(periodEnd).expiringSoon
                            ? "destructive"
                            : "default"
                        }
                      >
                        {isExpired
                          ? "Expired"
                          : isSubscriptionExpired(periodEnd).expiringSoon
                            ? `Expiring in ${isSubscriptionExpired(periodEnd).remainingDays} days`
                            : "Running"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Your subscription details and management options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Plan
                      </p>
                      <p className="font-medium">
                        {PLANS.find((p) => p.id === data?.planId)?.name}
                      </p>
                    </div>
                    <div className="space-y-1"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Billing Started on
                      </p>
                      <p className="font-medium">
                        {formatDate(
                          new Date(data?.currentPeriodStart?.toString() || ""),
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {data?.status === "trial"
                          ? "Trial ends on"
                          : data?.status === "canceled"
                            ? "Subscription ends on"
                            : "Next billing date"}
                      </p>
                      <p className="font-medium">
                        {formatDate(
                          new Date(data?.currentPeriodEnd?.toString() || ""),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Premium Features</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={async (e) => {
                      e.currentTarget.disabled = true;
                      const res = await createCustomerPortal();
                      if (res) router.push(res);
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Calendar1Icon className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                  {isExpired && (
                      <Button
                        onClick={async (e) => {
                          e.currentTarget.disabled = true;

                          if (data?.status === "trial") {
                            const res = await createStripeSession("plan:1");
                            if (res) router.push(res);
                          } else {
                            const res = await createCustomerPortal();
                            if (res) router.push(res);
                          }
                        }}
                        className="w-full sm:w-auto"
                      >
                        <MdSubscriptions className="mr-2 h-4 w-4" />
                        Renew
                      </Button>
                    )}
                </CardFooter>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionStatus;
