import { cn } from "@/lib/cn";

type PulseDotProps = {
  className?: string;
  /* Tailwind colour class for the dot and its ring, e.g. "bg-accent-settled" */
  tone?: string;
};

/* A 6px dot with a ring pinging out of it. The ring is a sibling at the
   same size rather than a smaller box, so `inset-0` alone centres it and
   the scale keyframe has no translate to clobber. */
const PulseDot = ({ className, tone = "bg-accent-settled" }: PulseDotProps) => (
  <span className={cn("relative inline-flex h-1.5 w-1.5", className)}>
    <span
      aria-hidden
      className={cn(
        "absolute inset-0 rounded-full opacity-60 animate-m-ping-sm",
        tone
      )}
    />
    <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", tone)} />
  </span>
);

export default PulseDot;
