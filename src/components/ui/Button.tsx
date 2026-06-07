import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background border border-foreground hover:bg-transparent hover:text-foreground",
  secondary:
    "bg-transparent text-foreground border border-border hover:border-foreground",
  ghost: "bg-transparent text-muted hover:text-foreground border border-transparent",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors disabled:opacity-40 disabled:pointer-events-none",
        variantStyles[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
