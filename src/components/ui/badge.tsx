import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-semibold transition-colors ",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-black text-white shadow ",
        secondary: "border-transparent bg-gray-200 text-gray-800 ",
        destructive:
          "border-transparent bg-red-500 text-white shadow",
        "destructive-outline": "border-red-500 text-red-500",
        outline: "text-gray-900",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      radius: {
        none: "rounded-none",
        md: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      radius: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, radius, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, radius, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
