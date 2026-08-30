import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client.js";
import { Card } from "../../components/ui/Card.js";
import { formatMoney } from "../../utils/money.js";

interface ServicePlan {
  id: string;
  tier: "STARTER" | "PREMIUM";
  priceTnd: number;
}

interface Service {
  id: string;
  key: string;
  nameFr: string;
  taglineFr: string;
  plans: ServicePlan[];
}

export function ServicePickerPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Service[]>("/services")
      .then(setServices)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les services"));
  }, []);

  if (error) return <p style={{ padding: 48, color: "var(--color-accent-700)" }}>{error}</p>;
  if (!services) return <p style={{ padding: 48 }}>Chargement…</p>;

  return (
    <div style={{ padding: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {services.map((service) => {
        const startFrom = service.plans.find((p) => p.tier === "STARTER");
        return (
          <Link key={service.id} to={`/create/${service.key}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Card style={{ height: "100%" }}>
              <h3>{service.nameFr}</h3>
              <p style={{ opacity: 0.7, minHeight: 40 }}>{service.taglineFr}</p>
              {startFrom && (
                <p style={{ color: "var(--color-accent)", marginTop: 12 }}>
                  à partir de {formatMoney(startFrom.priceTnd, "TND")}
                </p>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
