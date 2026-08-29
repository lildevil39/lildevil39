import { useParams, useSearchParams } from "react-router-dom";

/**
 * Two-column workflow: left = step form (max 640px), right = sticky live
 * preview (phone frame 392×844 for invitation/business card, A4 for CV,
 * 16:9 for logo/brand). Collapses to a full-screen "Aperçu" sheet under
 * 1024px. TODO: per-service step form + PATCH /projects/:id autosave.
 */
export function CreateServicePage() {
  const { serviceKey } = useParams();
  const [params] = useSearchParams();
  const projectId = params.get("projectId");

  return (
    <div style={{ display: "flex", gap: 48, padding: 48 }}>
      <div style={{ maxWidth: 640, flex: 1 }}>
        <h2>{serviceKey}</h2>
        <p>Project: {projectId ?? "(new)"}</p>
        <p>TODO: multi-step form per service.</p>
      </div>
      <div
        style={{
          width: 392,
          height: 844,
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          position: "sticky",
          top: 24,
        }}
      >
        <p style={{ textAlign: "center", padding: 16 }}>Aperçu</p>
      </div>
    </div>
  );
}
