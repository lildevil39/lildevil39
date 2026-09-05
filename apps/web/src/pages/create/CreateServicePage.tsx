import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../api/client.js";
import { Button } from "../../components/ui/Button.js";

interface Template {
  id: string;
  code: string;
  name: string;
  config: { [key: string]: string };
}

interface WeddingInvitation {
  brideName: string | null;
  groomName: string | null;
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string | null;
  address: string | null;
  messageFr: string | null;
}

interface Project {
  id: string;
  serviceId: string;
  templateId: string | null;
  currentStep: number;
  service: { key: string; nameFr: string };
  template: Template | null;
  invitation: WeddingInvitation | null;
}

const STEPS = ["Couple", "Détails", "Texte", "Modèle", "Aperçu"] as const;

const fieldStyle: React.CSSProperties = {
  padding: 10,
  border: "1px solid var(--color-border)",
  borderRadius: 4,
  fontFamily: "var(--font-body)",
  fontSize: 15,
  width: "100%",
};

/**
 * Two-column workflow per README § Create /create/:serviceKey — left is
 * the step form (max 640px), right is a sticky live preview. Only
 * wedding-invitation is wired to real persistence right now; other
 * services show an honest "not built yet" placeholder instead of a form
 * that silently goes nowhere.
 */
export function CreateServicePage() {
  const { serviceKey } = useParams();
  const [params, setParams] = useSearchParams();
  const projectId = params.get("projectId");

  const [project, setProject] = useState<Project | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Mirrors `project` so async handlers always read the current id, never a
  // stale one captured in an event-handler closure from an earlier render.
  const projectRef = useRef<Project | null>(null);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingTime, setWeddingTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [messageFr, setMessageFr] = useState("");

  // Bootstrap: create the draft project if we don't have one yet, then hydrate the form from it.
  // Guarded by a ref (not just the effect dependency array) because React 18
  // StrictMode double-invokes effects in dev — without this, that fires
  // POST /projects twice and creates two orphaned draft rows.
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (!serviceKey || bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      try {
        let id = projectId;
        if (!id) {
          const created = await api.post<Project>("/projects", { serviceKey, planTier: "STARTER" });
          id = created.id;
          setParams({ projectId: id }, { replace: true });
        }
        const loaded = await api.get<Project>(`/projects/${id}`);
        setProject(loaded);
        setStep(Math.min(Math.max(loaded.currentStep - 1, 0), STEPS.length - 1));
        if (loaded.invitation) {
          setBrideName(loaded.invitation.brideName ?? "");
          setGroomName(loaded.invitation.groomName ?? "");
          setWeddingDate(loaded.invitation.weddingDate ? loaded.invitation.weddingDate.slice(0, 10) : "");
          setWeddingTime(loaded.invitation.weddingTime ?? "");
          setVenueName(loaded.invitation.venueName ?? "");
          setAddress(loaded.invitation.address ?? "");
          setMessageFr(loaded.invitation.messageFr ?? "");
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Impossible de charger le projet");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceKey]);

  useEffect(() => {
    if (serviceKey === "wedding-invitation") {
      api
        .get<Template[]>(`/services/${serviceKey}/templates`)
        .then(setTemplates)
        .catch(() => {});
    }
  }, [serviceKey]);

  /** Returns whether the save actually happened, so callers don't advance the step on a no-op. */
  async function saveStep(data: Record<string, unknown>): Promise<boolean> {
    const current = projectRef.current;
    if (!current) {
      setError("Le projet n'est pas encore chargé — réessayez dans un instant.");
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<Project>(`/projects/${current.id}`, { step: step + 2, data });
      setProject(updated);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next(data: Record<string, unknown>) {
    const ok = await saveStep(data);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function selectTemplate(templateId: string) {
    const current = projectRef.current;
    if (!current) {
      setError("Le projet n'est pas encore chargé — réessayez dans un instant.");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.patch<Project>(`/projects/${current.id}`, {
        step: step + 1,
        data: { templateId },
      });
      setProject(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  if (serviceKey !== "wedding-invitation") {
    return (
      <div style={{ padding: 48 }}>
        <h2>{serviceKey}</h2>
        <p>Le formulaire pour ce service n'est pas encore construit — seule l'invitation de mariage l'est.</p>
      </div>
    );
  }

  if (error && !project) return <p style={{ padding: 48, color: "var(--color-accent-700)" }}>{error}</p>;
  if (!project) return <p style={{ padding: 48 }}>Chargement…</p>;

  return (
    <div style={{ padding: 48 }}>
      <StepRail current={step} />
      <div style={{ display: "flex", gap: 48, marginTop: 32, alignItems: "flex-start" }}>
        <div style={{ maxWidth: 640, flex: 1 }}>
          {error && <p style={{ color: "var(--color-accent-700)" }}>{error}</p>}

          {step === 0 && (
            <StepCouple
              brideName={brideName}
              groomName={groomName}
              setBrideName={setBrideName}
              setGroomName={setGroomName}
              saving={saving}
              onNext={() => next({ brideName, groomName })}
            />
          )}
          {step === 1 && (
            <StepDetails
              weddingDate={weddingDate}
              weddingTime={weddingTime}
              venueName={venueName}
              address={address}
              setWeddingDate={setWeddingDate}
              setWeddingTime={setWeddingTime}
              setVenueName={setVenueName}
              setAddress={setAddress}
              saving={saving}
              onBack={() => setStep(0)}
              onNext={() => next({ weddingDate: weddingDate || undefined, weddingTime, venueName, address })}
            />
          )}
          {step === 2 && (
            <StepText
              messageFr={messageFr}
              setMessageFr={setMessageFr}
              saving={saving}
              onBack={() => setStep(1)}
              onNext={() => next({ messageFr })}
            />
          )}
          {step === 3 && (
            <StepTemplate
              templates={templates}
              selectedId={project.templateId}
              saving={saving}
              onBack={() => setStep(2)}
              onSelect={selectTemplate}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && <StepReview project={project} onBack={() => setStep(3)} />}
        </div>

        <PreviewPanel
          brideName={brideName}
          groomName={groomName}
          weddingDate={weddingDate}
          template={project.template}
        />
      </div>
    </div>
  );
}

function StepRail({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 16 }}>
      {STEPS.map((label, i) => (
        <div
          key={label}
          style={{
            paddingBottom: 8,
            borderBottom: i === current ? "2px solid var(--color-accent)" : "2px solid transparent",
            color: i <= current ? "var(--color-text)" : "var(--color-muted, #999)",
            fontSize: 14,
          }}
        >
          <span style={{ fontVariantNumeric: "tabular-nums", marginRight: 6 }}>{String(i + 1).padStart(2, "0")}</span>
          {label}
        </div>
      ))}
    </div>
  );
}

function StepCouple(props: {
  brideName: string;
  groomName: string;
  setBrideName: (v: string) => void;
  setGroomName: (v: string) => void;
  saving: boolean;
  onNext: () => void;
}) {
  return (
    <div>
      <h2>Le couple</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <input placeholder="Prénom de la mariée" value={props.brideName} onChange={(e) => props.setBrideName(e.target.value)} style={fieldStyle} />
        <input placeholder="Prénom du marié" value={props.groomName} onChange={(e) => props.setGroomName(e.target.value)} style={fieldStyle} />
        <Button disabled={props.saving} onClick={props.onNext} style={{ alignSelf: "flex-start" }}>
          {props.saving ? "Enregistrement…" : "Suivant"}
        </Button>
      </div>
    </div>
  );
}

function StepDetails(props: {
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  address: string;
  setWeddingDate: (v: string) => void;
  setWeddingTime: (v: string) => void;
  setVenueName: (v: string) => void;
  setAddress: (v: string) => void;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2>Détails</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <input type="date" value={props.weddingDate} onChange={(e) => props.setWeddingDate(e.target.value)} style={fieldStyle} />
        <input placeholder="Heure (ex: 17:00)" value={props.weddingTime} onChange={(e) => props.setWeddingTime(e.target.value)} style={fieldStyle} />
        <input placeholder="Lieu" value={props.venueName} onChange={(e) => props.setVenueName(e.target.value)} style={fieldStyle} />
        <input placeholder="Adresse" value={props.address} onChange={(e) => props.setAddress(e.target.value)} style={fieldStyle} />
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="ghost" onClick={props.onBack}>Précédent</Button>
          <Button disabled={props.saving} onClick={props.onNext}>{props.saving ? "Enregistrement…" : "Suivant"}</Button>
        </div>
      </div>
    </div>
  );
}

function StepText(props: {
  messageFr: string;
  setMessageFr: (v: string) => void;
  saving: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2>Votre message</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <textarea
          placeholder="Le mot que vos invités liront…"
          value={props.messageFr}
          onChange={(e) => props.setMessageFr(e.target.value)}
          rows={5}
          style={{ ...fieldStyle, resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="ghost" onClick={props.onBack}>Précédent</Button>
          <Button disabled={props.saving} onClick={props.onNext}>{props.saving ? "Enregistrement…" : "Suivant"}</Button>
        </div>
      </div>
    </div>
  );
}

function StepTemplate(props: {
  templates: Template[];
  selectedId: string | null;
  saving: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2>Choisissez un modèle</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
        {props.templates.map((t) => {
          const colors = Object.values(t.config ?? {});
          const selected = props.selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => props.onSelect(t.id)}
              disabled={props.saving}
              style={{
                border: selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                borderRadius: 4,
                padding: 12,
                textAlign: "left",
                background: "var(--color-surface)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {colors.slice(0, 3).map((c, i) => (
                  <span key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>{t.code}</div>
              <div>{t.name}</div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Button variant="ghost" onClick={props.onBack}>Précédent</Button>
        <Button onClick={props.onNext} disabled={!props.selectedId}>Suivant</Button>
      </div>
    </div>
  );
}

function StepReview({ project, onBack }: { project: Project; onBack: () => void }) {
  const [status, setStatus] = useState<"idle" | "ordering" | "paying" | "publishing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  async function order() {
    setError(null);
    try {
      setStatus("ordering");
      const { orderId } = await api.post<{ orderId: string }>(`/projects/${project.id}/submit`);

      setStatus("paying");
      // PAYMENT_PROVIDER=mock (the dev default) finalizes instantly — no
      // real redirect to wait on. A real provider would redirect the
      // browser to checkoutUrl instead of continuing straight to publish.
      await api.post(`/payments/checkout`, { orderId });

      setStatus("publishing");
      const { url } = await api.post<{ url: string }>(`/projects/${project.id}/publish`);
      setPublishedUrl(url);
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la commande");
      setStatus("idle");
    }
  }

  if (publishedUrl) {
    return (
      <div>
        <h2>C'est en ligne !</h2>
        <p style={{ opacity: 0.7 }}>Votre invitation est publiée et prête à être partagée.</p>
        <a href={publishedUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)", wordBreak: "break-all" }}>
          {publishedUrl}
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2>Aperçu</h2>
      <p style={{ opacity: 0.7 }}>Vérifiez les informations ci-contre avant de commander.</p>
      <dl style={{ marginTop: 16 }}>
        <dt style={{ opacity: 0.6, fontSize: 12, textTransform: "uppercase" }}>Mariés</dt>
        <dd>{project.invitation?.brideName ?? "—"} & {project.invitation?.groomName ?? "—"}</dd>
        <dt style={{ opacity: 0.6, fontSize: 12, textTransform: "uppercase", marginTop: 12 }}>Date</dt>
        <dd>{project.invitation?.weddingDate ? new Date(project.invitation.weddingDate).toLocaleDateString("fr-FR") : "—"}</dd>
        <dt style={{ opacity: 0.6, fontSize: 12, textTransform: "uppercase", marginTop: 12 }}>Modèle</dt>
        <dd>{project.template?.name ?? "—"}</dd>
      </dl>
      {error && <p style={{ color: "var(--color-accent-700)" }}>{error}</p>}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Button variant="ghost" onClick={onBack} disabled={status !== "idle"}>Précédent</Button>
        <Button onClick={order} disabled={status !== "idle"}>
          {status === "idle" && "Enregistrer et commander"}
          {status === "ordering" && "Création de la commande…"}
          {status === "paying" && "Paiement…"}
          {status === "publishing" && "Publication…"}
        </Button>
      </div>
    </div>
  );
}

function PreviewPanel({
  brideName,
  groomName,
  weddingDate,
  template,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
  template: Template | null;
}) {
  const colors = template ? Object.values(template.config ?? {}) : [];
  const accent = colors[1] ?? "var(--ivory-champagne)";
  const bg = colors[0] ?? "var(--ivory-ivory, #F7F2EA)";
  const ink = colors[2] ?? "var(--ivory-ink)";

  return (
    <div
      style={{
        width: 392,
        minHeight: 700,
        border: "1px solid var(--color-border)",
        borderRadius: 24,
        position: "sticky",
        top: 24,
        overflow: "hidden",
        background: bg,
        color: ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 32,
        fontFamily: "var(--font-display)",
      }}
    >
      <span style={{ fontSize: 11, letterSpacing: "0.44em", textTransform: "uppercase", opacity: 0.7 }}>
        {weddingDate ? new Date(weddingDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "Date à définir"}
      </span>
      <div style={{ fontSize: 40, marginTop: 24, lineHeight: 1.1 }}>
        {brideName || "…"}
        <br />
        <span style={{ fontSize: 22, opacity: 0.7 }}>&amp;</span>
        <br />
        {groomName || "…"}
      </div>
      <div style={{ width: 48, height: 1, background: accent as string, marginTop: 32 }} />
      {template && (
        <span style={{ marginTop: 16, fontSize: 12, opacity: 0.6, fontFamily: "var(--font-body)" }}>
          {template.name}
        </span>
      )}
    </div>
  );
}
