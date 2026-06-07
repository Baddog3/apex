import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={["border border-border p-6", className].filter(Boolean).join(" ")}
      {...props}
    >
      {title && (
        <h3 className="mb-4 text-xs uppercase tracking-widest text-muted">{title}</h3>
      )}
      {children}
    </div>
  );
}
