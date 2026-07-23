import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "sage" | "lavender" | "muted";

const toneClasses: Record<Tone, string> = {
  sage: "bg-sage-100 text-sage-800",
  lavender: "bg-lavender-100 text-lavender-800",
  muted: "bg-cream-200 text-muted",
};

export function Badge({
  tone = "sage",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
