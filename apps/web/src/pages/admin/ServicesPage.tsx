import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { formatMoney } from "../../utils/money.js";

interface Plan {
  id: string;
  tier: "STARTER" | "PREMIUM";
  priceTnd: number;
  priceEur: number;
  isActive: boolean;
}

interface Template {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface AdminService {
  id: string;
  key: string;
  nameFr: string;
  taglineFr: string;
  icon: string;
  isActive: boolean;
  plans: Plan[];
  templates: Template[];
}

const inputStyle: React.CSSProperties = {
  padding: 8,
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  fontFamily: "var(--font-body)",
  fontSize: 14,
};

/**
 * Admin catalogue manager: edit each service's copy/pricing, and create /
 * edit its templates ("modèles"). See README § Admin and docs-api-spec.md
 * § Admin for the underlying /admin/services and /admin/templates routes.
 */
export function ServicesPage() {
  const [services, setServices] = useState<AdminService[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    try {
      const data = await api.get<AdminService[]>("/admin/services");
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les services");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveService(service: AdminService, patch: Record<string, unknown>) {
    await api.put(`/admin/services/${service.key}`, patch);
    await load();
  }

  async function savePlan(service: AdminService, plan: Plan, priceTnd: number) {
    await api.put(`/admin/services/${service.key}/plans`, {
      plans: [{ tier: plan.tier, priceTnd }],
    });
    await load();
  }

  async function createTemplate(service: AdminService, code: string, name: string) {
    await api.post("/admin/templates", { serviceKey: service.key, code, name, config: {} });
    await load();
  }

  async function toggleTemplate(template: Template) {
    await api.put(`/admin/templates/${template.id}`, { isActive: !template.isActive });
    await load();
  }

  if (error) return <p style={{ color: "var(--color-accent-700)" }}>{error}</p>;
  if (!services) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Services & modèles</h1>
      <p style={{ color: "var(--color-text)", opacity: 0.7 }}>
        Modifiez le tarif et le texte de chaque service, et gérez ses modèles (templates).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {services.map((service) => (
          <Card key={service.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>{service.nameFr}</h3>
                <p style={{ margin: "4px 0", opacity: 0.7 }}>{service.taglineFr}</p>
              </div>
              <Button onClick={() => setExpanded(expanded === service.key ? null : service.key)}>
                {expanded === service.key ? "Fermer" : "Gérer"}
              </Button>
            </div>

            {expanded === service.key && (
              <div style={{ marginTop: 24, borderTop: "1px solid var(--color-border)", paddingTop: 24 }}>
                <ServiceEditor service={service} onSaveService={saveService} onSavePlan={savePlan} />
                <TemplatesEditor
                  service={service}
                  onCreate={createTemplate}
                  onToggle={toggleTemplate}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ServiceEditor({
  service,
  onSaveService,
  onSavePlan,
}: {
  service: AdminService;
  onSaveService: (service: AdminService, patch: Record<string, unknown>) => Promise<void>;
  onSavePlan: (service: AdminService, plan: Plan, priceTnd: number) => Promise<void>;
}) {
  const [tagline, setTagline] = useState(service.taglineFr);
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <h4>Texte</h4>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSaveService(service, { taglineFr: tagline });
            setSaving(false);
          }}
        >
          Enregistrer
        </Button>
      </div>

      <h4 style={{ marginTop: 16 }}>Tarifs</h4>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {service.plans.map((plan) => (
          <PlanEditor key={plan.id} plan={plan} onSave={(price) => onSavePlan(service, plan, price)} />
        ))}
      </div>
    </div>
  );
}

function PlanEditor({ plan, onSave }: { plan: Plan; onSave: (priceTnd: number) => Promise<void> }) {
  const [price, setPrice] = useState(String(plan.priceTnd / 1000));
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ textTransform: "uppercase", fontSize: 12, letterSpacing: "0.05em" }}>{plan.tier}</span>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ ...inputStyle, width: 90 }}
      />
      <span style={{ fontSize: 12, opacity: 0.6 }}>TND · {formatMoney(plan.priceTnd, "TND")}</span>
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(Math.round(Number(price) * 1000));
          setSaving(false);
        }}
      >
        OK
      </Button>
    </div>
  );
}

function TemplatesEditor({
  service,
  onCreate,
  onToggle,
}: {
  service: AdminService;
  onCreate: (service: AdminService, code: string, name: string) => Promise<void>;
  onToggle: (template: Template) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <h4>Modèles ({service.templates.length})</h4>
      <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <tbody>
          {service.templates.map((template) => (
            <tr key={template.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: "8px 0", fontFamily: "monospace", fontSize: 13 }}>{template.code}</td>
              <td style={{ padding: "8px 0" }}>{template.name}</td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>
                <span
                  className="tag"
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: `1px solid ${template.isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                    color: template.isActive ? "var(--color-accent)" : "inherit",
                  }}
                >
                  {template.isActive ? "actif" : "inactif"}
                </span>
              </td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>
                <Button variant="ghost" onClick={() => onToggle(template)}>
                  {template.isActive ? "Désactiver" : "Activer"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input placeholder="Code (ex: INV-06)" value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} />
        <input placeholder="Nom du modèle" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <Button
          disabled={creating || !code || !name}
          onClick={async () => {
            setCreating(true);
            await onCreate(service, code, name);
            setCode("");
            setName("");
            setCreating(false);
          }}
        >
          Ajouter un modèle
        </Button>
      </div>
    </div>
  );
}
