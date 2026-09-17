import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipProps = {
  children: ReactNode;
  className?: string;
};

const Chip = ({ children, className }: ChipProps) => (
  <span
    className={cn(
      "chip-bar inline-flex h-8 items-center gap-2 rounded-[48px] border border-white/5 px-4",
      className
    )}
  >
    {children}
  </span>
);

export default Chip;
