import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.js";

const NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Mes projets", to: "/dashboard/projects" },
  { label: "Créer un projet", to: "/create" },
  { label: "Commandes", to: "/dashboard/orders" },
  { label: "Paiements", to: "/dashboard/payments" },
  { label: "Fichiers", to: "/dashboard/files" },
  { label: "Profil", to: "/dashboard/profile" },
  { label: "Paramètres", to: "/dashboard/settings" },
];

export function DashboardLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar items={NAV} />
      <div style={{ flex: 1, padding: 32 }}>
        <Outlet />
      </div>
    </div>
  );
}
