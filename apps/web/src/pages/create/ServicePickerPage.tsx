import { Link } from "react-router-dom";
import { SERVICE_KEYS } from "@nivora/shared";
import { Card } from "../../components/ui/Card.js";

/** Selecting a card creates a DRAFT project and routes to /create/:serviceKey?projectId=… (TODO: wire POST /projects). */
export function ServicePickerPage() {
  return (
    <div style={{ padding: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {SERVICE_KEYS.map((key) => (
        <Link key={key} to={`/create/${key}`} style={{ textDecoration: "none", color: "inherit" }}>
          <Card>{key}</Card>
        </Link>
      ))}
    </div>
  );
}
