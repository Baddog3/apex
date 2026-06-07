import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-xs uppercase tracking-widest text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-foreground",
          error ? "border-red-500" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
