import clsx, { type ClassValue } from "clsx";

/* Thin alias so call sites read the same as the landing page's. No
   tailwind-merge: overrides are written as replace (`x ?? default`), not as
   a later class winning a merge. */
export const cn = (...inputs: ClassValue[]) => clsx(inputs);
