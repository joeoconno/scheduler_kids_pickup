"use client";

import { ReactNode, useState, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

export function Modal({
  trigger,
  title,
  description,
  children,
  className,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen(true),
      })
    : trigger;

  return (
    <>
      {triggerNode}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-card-border bg-card p-6 shadow-xl",
              className
            )}
          >
            <div className="mb-4">
              <h2 className="font-display text-xl font-medium text-foreground">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}
