import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.js";

const NAV = [
  { label: "Dashboard", to: "/admin" },
  { label: "Utilisateurs", to: "/admin/users" },
  { label: "Projets", to: "/admin/projects" },
  { label: "Commandes", to: "/admin/orders" },
  { label: "Paiements", to: "/admin/payments" },
  { label: "Services & modèles", to: "/admin/services" },
  { label: "Invitations", to: "/admin/invitations" },
  { label: "Vidéos", to: "/admin/videos" },
  { label: "CVs", to: "/admin/cvs" },
  { label: "Logos", to: "/admin/logos" },
  { label: "Identités", to: "/admin/branding" },
  { label: "Musique", to: "/admin/music" },
  { label: "Fichiers", to: "/admin/files" },
  { label: "Coupons", to: "/admin/coupons" },
  { label: "Paramètres", to: "/admin/settings" },
];

export function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar items={NAV} />
      <div style={{ flex: 1, padding: 32 }}>
        <Outlet />
      </div>
    </div>
  );
}
