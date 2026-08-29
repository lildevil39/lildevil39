import { useTranslation } from "react-i18next";
import { Card } from "../../components/ui/Card.js";

/** TODO: recent orders table + per-invitation RSVP summary strip — see README § Customer dashboard. */
export function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("dashboard.welcome", { firstName: "…" })}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 24 }}>
        <Card>
          <div style={{ fontSize: 48 }}>0</div>
          <span style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em" }}>
            {t("dashboard.active_projects")}
          </span>
        </Card>
        <Card>
          <div style={{ fontSize: 48 }}>0</div>
          <span style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em" }}>
            {t("dashboard.completed")}
          </span>
        </Card>
        <Card>
          <div style={{ fontSize: 48 }}>0</div>
          <span style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.1em" }}>
            {t("dashboard.pending_payment")}
          </span>
        </Card>
      </div>
    </div>
  );
}
