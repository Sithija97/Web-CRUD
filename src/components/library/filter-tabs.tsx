import type { FileCounts, PaperType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: {
  value: PaperType | "";
  label: string;
  countKey: keyof FileCounts;
}[] = [
  { value: "", label: "All", countKey: "all" },
  { value: "past_paper", label: "Past Papers", countKey: "past_paper" },
  { value: "model_paper", label: "Model Papers", countKey: "model_paper" },
  {
    value: "marking_scheme",
    label: "Marking Schemes",
    countKey: "marking_scheme",
  },
  { value: "notes", label: "Notes", countKey: "notes" },
  { value: "other", label: "Other", countKey: "other" },
];

interface Props {
  value: PaperType | "";
  counts: FileCounts | undefined;
  onChange: (value: PaperType | "") => void;
}

export function FilterTabs({ value, counts, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Paper type"
      className="flex gap-1 overflow-x-auto border-b border-border scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value || "all"}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-primary dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                active
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {counts ? counts[tab.countKey] : "–"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
