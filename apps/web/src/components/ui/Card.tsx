import type { HTMLAttributes } from "react";

/** 1px border, radius 4px, no fill — hover raises the border to accent + a slight lift. */
export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: 24,
        background: "var(--color-surface)",
        ...props.style,
      }}
    />
  );
}
