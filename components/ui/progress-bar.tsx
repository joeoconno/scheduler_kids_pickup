import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  className,
  tone = "sage",
}: {
  value: number;
  className?: string;
  tone?: "sage" | "lavender";
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-cream-200", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          tone === "sage" ? "bg-sage-500" : "bg-lavender-500"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
