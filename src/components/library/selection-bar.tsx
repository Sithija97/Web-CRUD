import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}

export function SelectionBar({ count, onClear, onDelete }: Props) {
  return (
    <div
      role="region"
      aria-label="Selection actions"
      className="sticky top-2 z-20 flex items-center gap-3 rounded-lg shadow-sm  border-primary/30 bg-accent px-4 py-2"
    >
      <span className="text-sm font-medium text-accent-foreground">
        {count} selected
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="ml-auto"
        onClick={onDelete}
      >
        <Trash2 />
        Delete{count > 1 ? ` ${count}` : ""}
      </Button>
    </div>
  );
}
