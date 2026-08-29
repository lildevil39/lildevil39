import { NavLink } from "react-router-dom";

interface SidebarProps {
  items: { label: string; to: string }[];
}

/** 260px sidebar, collapses to a bottom tab bar under 768px (TODO: media query variant). */
export function Sidebar({ items }: SidebarProps) {
  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid var(--color-border)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            padding: "10px 12px",
            borderRadius: "var(--radius)",
            textDecoration: "none",
            color: "var(--color-text)",
            borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
