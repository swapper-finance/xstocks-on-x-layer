import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const Container = ({ children, className }: ContainerProps) => (
  <div
    className={cn(
      "mx-auto box-content max-w-content px-5 md:px-6 lg:px-10",
      className
    )}
  >
    {children}
  </div>
);

export default Container;
