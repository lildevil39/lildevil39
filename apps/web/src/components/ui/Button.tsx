import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "ghost";
}

/** Colour as stroke, not fill — no solid accent blocks. See README § Design language. */
export function Button({ variant = "outline", style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: 15,
    padding: "12px 24px",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "all 200ms ease-out",
    background: "transparent",
    border:
      variant === "outline" ? "1px solid var(--color-accent)" : "1px solid transparent",
    color: variant === "outline" ? "var(--color-accent)" : "var(--color-text)",
  };
  return <button {...props} style={{ ...base, ...style }} />;
}
