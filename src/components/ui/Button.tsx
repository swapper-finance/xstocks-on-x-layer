import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";

/* Both variants are 40px tall, 16/12 padding, 8px radius, and carry the
   same 12/20 · 2% Medium label.

   primary   — #E5E5E6 plate, #101114 label, 2px inset white highlight,
               going to pure white on hover and press.
   secondary — 3% white plate with a 1% hairline and two masked gradient
               rules top and bottom; the bottom one widens on press.

   Press is a scale shared by both: down to 0.96 over 150ms on
   cubic-bezier(.25,.1,.25,1), back to 1 over 300ms on
   cubic-bezier(.34,1.3,.64,1), so the release overshoots slightly.

   Exported on its own so anchors can wear the same plate. */
export const buttonStyles = (
  variant: Variant = "primary",
  className?: string
) =>
  cn(
    "relative inline-flex h-10 items-center justify-center gap-2 select-none rounded-lg px-4 py-3 text-xs font-medium tracking-[0.02em] [transition:transform_300ms_cubic-bezier(0.34,1.3,0.64,1),background-color_150ms_ease-out,opacity_200ms_ease-out] active:[transition:transform_150ms_cubic-bezier(0.25,0.1,0.25,1),background-color_150ms_ease-out] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40",
    variant === "primary" &&
      "bg-[#E5E5E6] text-lp-surface-base shadow-[inset_0px_2px_4px_0px_rgba(255,255,255,0.2)] hover:bg-white active:bg-white",
    variant === "secondary" &&
      "border border-white/[0.01] bg-white/[0.03] text-white before:absolute before:-top-px before:left-1/2 before:h-px before:w-[72px] before:-translate-x-1/2 before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06)_30%,rgba(255,255,255,0.06)_70%,transparent)] after:absolute after:-bottom-px after:left-1/2 after:h-px after:w-8 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05)_30%,rgba(255,255,255,0.05)_70%,transparent)] after:[transition:width_150ms_ease-out] hover:bg-white/[0.05] hover:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.072)_30%,rgba(255,255,255,0.072)_70%,transparent)] active:bg-white/[0.05] active:after:w-16",
    className
  );

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) => (
  <button type={type} className={buttonStyles(variant, className)} {...props}>
    {children}
  </button>
);

export default Button;
