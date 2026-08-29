import { Card } from "../../components/ui/Card.js";

/** TODO: stats (users, revenue TND+EUR, orders, pending, completed) — see README § Admin. */
export function AdminPage() {
  return (
    <div>
      <h1>Admin</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 24 }}>
        <Card>Utilisateurs — 0</Card>
        <Card>Revenu — 0 TND</Card>
        <Card>Commandes — 0</Card>
        <Card>En attente — 0</Card>
      </div>
    </div>
  );
}
