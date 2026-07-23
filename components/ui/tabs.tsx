"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  defaultValue,
}: {
  tabs: { value: string; label: string; content: ReactNode }[];
  defaultValue?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div>
      <div className="mb-6 inline-flex gap-1 rounded-full bg-cream-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
