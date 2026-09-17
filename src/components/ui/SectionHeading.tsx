import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

/* Every section opens this way: a 10px uppercase kicker at 20% white, a
   metallic display heading, and a 14/20 description at 40%. */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  size = "md",
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) => (
  <div
    className={cn(
      "flex flex-col",
      size === "sm" ? "gap-3" : "gap-3 md:gap-4",
      className
    )}
  >
    {eyebrow && (
      <span className="mb-3 text-xxs font-semibold uppercase text-white/20 md:mb-2">
        {eyebrow}
      </span>
    )}
    <h2
      className={cn(
        "text-metallic font-medium",
        titleClassName ??
          (size === "sm" ? "text-display-sm" : "text-display-sm md:text-display-md")
      )}
    >
      {title}
    </h2>
    {description && (
      <p
        className={cn(
          "text-desc-sm text-white/40",
          descriptionClassName ?? (size === "sm" ? "max-w-[424px]" : "max-w-[496px]")
        )}
      >
        {description}
      </p>
    )}
  </div>
);

export default SectionHeading;
