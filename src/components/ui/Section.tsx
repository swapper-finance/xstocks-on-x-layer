import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Container from "./Container";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /* Escape hatch for sections whose art bleeds past the content column */
  bleed?: boolean;
  /* "none" hands the vertical rhythm back to the caller */
  padding?: "default" | "none";
};

const Section = ({
  id,
  children,
  className,
  bleed = false,
  padding = "default",
}: SectionProps) => (
  <section
    id={id}
    className={cn(
      "relative",
      padding === "default" && "py-16 md:py-[72px] lg:py-28",
      className
    )}
  >
    {bleed ? children : <Container>{children}</Container>}
  </section>
);

export default Section;
