"use client"

import { Check, X, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/constants/plans"
import Link from "next/link"
import { cn } from "@/lib/cn"
import { useRouter } from "next/navigation"
import { useState } from "react"


export type Props = {
  plans: typeof PLANS
  desc?: string
  header?: string
  onSelectPlan?: (plan: string) => void
}

export default function PricingCards(
  { plans, desc, header, onSelectPlan }: Props
) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const router = useRouter()

  return (
    <div id="pricing" className="w-full py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-3">{header || "Transparent Pricing"}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {desc || "Choose the plan that works best for you and your team. All plans include a free trial."}
          </p>

        </div>

        <div
          className={cn("grid grid-cols-1 gap-8  mx-auto",)}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${plan.highlighted
                ? "border-2 border-primary shadow-lg dark:shadow-primary/20"
                : "border border-border shadow-md"
                }`}

            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`p-6 ${plan.highlighted ? "pt-12" : "pt-6"}`}>
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">
                    ${plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <Button
                  onClick={() => {
                    if (onSelectPlan) onSelectPlan(plan.id)
                    else router.push(`/login?plan=${plan.id}`)
                    setSelectedPlan(plan.id)
                  }}
                  loading={selectedPlan === plan.id}
                  className={`w-full mb-6`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">What&apos;s included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-muted-foreground">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-start text-muted-foreground">
                            <X className="h-5 w-5 text-muted-foreground/70 mr-2 shrink-0 mt-0.5" />
                            <span className="text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

