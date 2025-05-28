import * as React from "react";

const Badge = React.forwardRef(({ className = "", variant = "outline", ...props }, ref) => {
  let base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  let color =
    variant === "outline"
      ? "border-gray-300 bg-white text-gray-800"
      : "bg-indigo-600 text-white border-transparent";
  return (
    <span ref={ref} className={`${base} ${color} ${className}`} {...props} />
  );
});
Badge.displayName = "Badge";

export { Badge };
