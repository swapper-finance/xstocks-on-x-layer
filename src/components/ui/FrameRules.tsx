/* The two full-height hairlines that bracket the content column once the
   viewport is wider than the 1344px frame. */
const FrameRules = () => (
  <>
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-[60] hidden w-px bg-white/5 left-[max(0px,calc((100vw-1344px)/2))] min-[1328px]:block"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 z-[60] hidden w-px bg-white/5 right-[max(0px,calc((100vw-1344px)/2))] min-[1328px]:block"
    />
  </>
);

export default FrameRules;
