import * as React from "react";

function Card({ className = "", ...props }) {
  return (
    <div
      className={
        "rounded-xl border bg-card text-card-foreground shadow " +
        className
      }
      {...props}
    />
  );
}

function CardHeader({ className = "", ...props }) {
  return (
    <div className={"flex flex-col space-y-1.5 p-6 " + className} {...props} />
  );
}

function CardContent({ className = "", ...props }) {
  return <div className={"p-6 pt-0 " + className} {...props} />;
}

function CardTitle({ className = "", ...props }) {
  return <h3 className={"text-lg font-semibold leading-none tracking-tight " + className} {...props} />;
}

function CardDescription({ className = "", ...props }) {
  return <p className={"text-sm text-muted-foreground " + className} {...props} />;
}

function CardFooter({ className = "", ...props }) {
  return <div className={"flex items-center p-6 pt-0 " + className} {...props} />;
}

export { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter };
