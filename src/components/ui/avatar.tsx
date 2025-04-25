"use client";

import React, { useState } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

/** Style variants for the avatar component */
const avatarVariants = cva("", {
  variants: {
    size: {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-14 w-14"
    },
    radius: {
      none: "rounded-none",
      md: "rounded-md",
      default: "rounded-full"
    }
  },
  defaultVariants: {
    size: "default",
    radius: "default"
  }
});

/** Base container for avatar components */
function AvatarRoot({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex shrink-0 overflow-hidden", className)}
      {...props}
    />
  );
}

/** Image component for the avatar */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
}

/** Fallback component shown when image fails to load */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "bg-muted flex h-full w-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

type AvatarProps = Omit<
  React.ComponentProps<typeof AvatarPrimitive.Root>,
  "children"
> &
  VariantProps<typeof avatarVariants> & {
    /** Source URL for the avatar image */
    src: string;
    /** Alt text for the avatar image */
    alt: string;
    /** Whether to show initials or full text as fallback */
    initials?: boolean;
    /** Optional fallback image source */
    fallbackSrc?: string;
  };

/** Main avatar component with image loading and fallback handling */
function Avatar({
  className,
  size,
  radius,
  initials = true,
  src,
  fallbackSrc,
  alt,
  ...props
}: AvatarProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <AvatarRoot
      className={cn(
        avatarVariants({ size, radius }),
        "relative border",
        className
      )}
      {...props}
    >
      <AvatarImage
        style={{ opacity: isImageLoaded ? 1 : 0 }}
        onLoadingStatusChange={(status) => {
          setIsImageLoaded(status !== "idle" && status !== "loading");
        }}
        src={src}
        alt={alt}
        className="transition-opacity ease-in-out"
      />
      <AvatarFallback>
        {!isImageLoaded ? (
          <span
            style={{ opacity: isImageLoaded ? 0 : 1 }}
            className="bg-primary/10 absolute inset-0 z-10 animate-pulse rounded-md transition-opacity ease-in-out"
          />
        ) : fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            style={{ opacity: isImageLoaded ? 1 : 0 }}
            className="aspect-square h-full w-full transition-opacity ease-in-out"
          />
        ) : initials ? (
          alt
            ?.split(" ")
            .map((name) => name?.charAt(0)?.toUpperCase())
            .slice(0, 2)
            .join("")
        ) : (
          alt
        )}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export { Avatar };
