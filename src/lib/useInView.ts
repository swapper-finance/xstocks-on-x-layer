import { useEffect, useRef, useState } from "react";

/* Flips once, the first time `threshold` of the node is on screen, and then
   stops observing — entrance animations play when their section is reached
   and are never rewound. */
export const useInView = <T extends HTMLElement>(threshold = 0.25) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView] as const;
};

export default useInView;
