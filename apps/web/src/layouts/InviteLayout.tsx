import { Outlet } from "react-router-dom";

/**
 * No header/footer, no login — the ivory register described in README §
 * Design language (B). dir is set per-page from wedding_invitations.locale.
 */
export function InviteLayout() {
  return (
    <div style={{ background: "#EFE8DC", minHeight: "100vh" }}>
      <Outlet />
    </div>
  );
}
