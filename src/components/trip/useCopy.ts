import { useState } from "react";
import { toast } from "sonner";

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${label ?? "Copied"}`, { description: text, duration: 1600 });
      setTimeout(() => setCopied(null), 1400);
    } catch {
      toast.error("Copy failed");
    }
  };
  return { copy, copied };
}