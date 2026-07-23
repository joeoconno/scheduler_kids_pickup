import Link from "next/link";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { buttonClasses, type Variant, type Size } from "@/components/ui/button";

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(buttonClasses(variant, size), className)} {...props} />;
}
