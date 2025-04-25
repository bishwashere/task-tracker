import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/cn";

export type SeparatorProps = React.ComponentProps<
  typeof SeparatorPrimitive.Root
>;

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
}

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
