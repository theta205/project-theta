import * as React from "react";

function Alert({ className = "", variant = "default", ...props }) {
  return (
    <div
      role="alert"
      className={
        `relative w-full rounded-lg border p-4 [&:has(svg)]:pl-11 ` +
        (variant === "destructive"
          ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
          : "bg-background text-foreground") +
        " " +
        className
      }
      {...props}
    />
  );
}

function AlertTitle({ className = "", ...props }) {
  return <h5 className={"mb-1 font-medium leading-none tracking-tight " + className} {...props} />;
}

function AlertDescription({ className = "", ...props }) {
  return <div className={"text-sm [&_p]:leading-relaxed " + className} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
