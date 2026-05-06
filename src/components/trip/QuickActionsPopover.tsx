import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useCopy } from "./useCopy";
import { cn } from "@/lib/utils";

export interface QuickAction {
  label: string;
  href?: string;
  icon: any;
  tone?: "default" | "primary" | "success";
}

export function QuickActionsPopover({
  value,
  display,
  actions,
  copyLabel = "Copied",
  children,
  className,
}: {
  value: string;
  display?: string;
  actions: QuickAction[];
  copyLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { copy, copied } = useCopy();
  const isCopied = copied === value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group inline-flex min-w-0 max-w-full items-center gap-1 truncate text-left text-xs font-medium transition-colors hover:text-primary",
            className,
          )}
        >
          {children ?? <span className="truncate">{display ?? value}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {display ?? value}
        </div>
        <div className="space-y-0.5">
          {actions.map((a) => {
            const Icon = a.icon;
            const Comp: any = a.href ? "a" : "button";
            return (
              <Comp
                key={a.label}
                href={a.href}
                target={a.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                  a.tone === "primary" && "text-primary",
                  a.tone === "success" && "text-success",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1">{a.label}</span>
                {a.href?.startsWith("http") && <ExternalLink className="h-3 w-3 opacity-50" />}
              </Comp>
            );
          })}
          <button
            onClick={() => copy(value, copyLabel)}
            className="flex w-full items-center gap-2 rounded-md border-t px-2 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="flex-1">{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}