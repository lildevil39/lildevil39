import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client.js";

interface WeddingInvitation {
  brideName: string | null;
  groomName: string | null;
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string | null;
  address: string | null;
  mapsUrl: string | null;
  locale: "FR" | "EN" | "AR";
  messageFr: string | null;
  messageEn: string | null;
  messageAr: string | null;
  rsvpEnabled: boolean;
  wishesEnabled: boolean;
  countdownEnabled: boolean;
}

interface InviteData {
  slug: string;
  template: { code: string; name: string; config: Record<string, string> } | null;
  invitation: WeddingInvitation;
}

interface Wish {
  id: string;
  name: string;
  message: string;
}

/**
 * Recreate design/Invitation-Islem-Akram.html pixel-faithfully in this
 * component (React + TS + Vite, ivory register tokens) — it is a design
 * *reference*, not code to copy in. Full fidelity (sealed envelope, wax
 * seal gesture, floating petals, parallax) is still TODO; this is a first,
 * real, working pass: real data, real RSVP/wishes, ivory tokens, no
 * envelope/seal motion yet. dir="rtl" when locale=AR.
 */
export function InvitePage() {
  const { slug } = useParams();
  const [data, setData] = useState<InviteData | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .get<InviteData>(`/public/invitations/${slug}`)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Invitation introuvable"));
    api
      .get<Wish[]>(`/public/invitations/${slug}/wishes`)
      .then(setWishes)
      .catch(() => {});
  }, [slug]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body, serif)", color: "var(--ivory-muted)" }}>{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const { invitation, template } = data;
  const palette = template?.config ?? {};
  const colors = Object.values(palette);
  const accent = (colors[1] ?? "var(--ivory-champagne)") as string;
  const ink = (colors[2] ?? "var(--ivory-ink)") as string;
  const bg = (colors[0] ?? "var(--ivory-paper)") as string;
  const message =
    invitation.locale === "AR" ? invitation.messageAr : invitation.locale === "EN" ? invitation.messageEn : invitation.messageFr;
  const dir = invitation.locale === "AR" ? "rtl" : "ltr";

  return (
    <div dir={dir} style={{ background: bg, color: ink, minHeight: "100vh", fontFamily: "var(--font-body, Georgia, serif)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.44em", textTransform: "uppercase", opacity: 0.7 }}>
          {invitation.weddingDate
            ? new Date(invitation.weddingDate).toLocaleDateString(invitation.locale === "EN" ? "en-US" : "fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>

        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontWeight: 400, fontSize: 62, lineHeight: 0.94, margin: "24px 0" }}>
          {invitation.brideName}
          <br />
          <span style={{ fontSize: 28, opacity: 0.6 }}>&amp;</span>
          <br />
          {invitation.groomName}
        </h1>

        <div style={{ width: 48, height: 1, background: accent, margin: "32px auto" }} />

        {message && (
          <p style={{ fontStyle: "italic", fontSize: 18, lineHeight: 1.6, maxWidth: "48ch", margin: "0 auto" }}>{message}</p>
        )}

        {invitation.countdownEnabled && invitation.weddingDate && <Countdown target={invitation.weddingDate} accent={accent} />}

        {(invitation.venueName || invitation.address) && (
          <div style={{ marginTop: 48 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6 }}>Lieu</span>
            <p style={{ marginTop: 8 }}>
              {invitation.venueName}
              {invitation.venueName && invitation.address && <br />}
              {invitation.address}
            </p>
            {invitation.mapsUrl && (
              <a href={invitation.mapsUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>
                Voir sur la carte
              </a>
            )}
          </div>
        )}

        {invitation.rsvpEnabled && <RsvpForm slug={data.slug} accent={accent} />}
        {invitation.wishesEnabled && <Wishes slug={data.slug} accent={accent} wishes={wishes} />}
      </div>
    </div>
  );
}

function Countdown({ target, accent }: { target: string; accent: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div style={{ marginTop: 48 }}>
      <span style={{ fontSize: 48, fontVariantNumeric: "tabular-nums", color: accent }}>{days}</span>
      <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6, marginTop: 4 }}>jours restants</p>
    </div>
  );
}

function RsvpForm({ slug, accent }: { slug: string; accent: string }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [attendance, setAttendance] = useState<"YES" | "NO" | "MAYBE">("YES");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/public/invitations/${slug}/rsvp`, { name, guests, attendance });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi");
    }
  }

  if (sent) return <p style={{ marginTop: 48 }}>Merci, votre réponse a bien été envoyée.</p>;

  return (
    <form onSubmit={submit} style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6 }}>RSVP</span>
      <input
        placeholder="Votre nom"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 12, borderRadius: "var(--ivory-radius-field, 12px)", border: "1px solid rgba(0,0,0,0.15)", background: "var(--ivory-card, #fff)" }}
      />
      <input
        type="number"
        min={1}
        value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        style={{ padding: 12, borderRadius: "var(--ivory-radius-field, 12px)", border: "1px solid rgba(0,0,0,0.15)", background: "var(--ivory-card, #fff)" }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {(["YES", "MAYBE", "NO"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAttendance(v)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${attendance === v ? accent : "rgba(0,0,0,0.15)"}`,
              background: attendance === v ? accent : "transparent",
              color: attendance === v ? "#fff" : "inherit",
              cursor: "pointer",
            }}
          >
            {v === "YES" ? "Je viens" : v === "MAYBE" ? "Peut-être" : "Je ne peux pas"}
          </button>
        ))}
      </div>
      {error && <p style={{ color: "#a33" }}>{error}</p>}
      <button
        type="submit"
        style={{ padding: 12, borderRadius: 999, border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer" }}
      >
        Envoyer
      </button>
    </form>
  );
}

function Wishes({ slug, accent, wishes }: { slug: string; accent: string; wishes: Wish[] }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Newly submitted wishes are PENDING moderation, so they don't join the
    // (approved-only) list above yet — just acknowledge receipt locally.
    await api.post(`/public/invitations/${slug}/wishes`, { name, message });
    setSent(true);
    setName("");
    setMessage("");
  }

  return (
    <div style={{ marginTop: 48, textAlign: "left" }}>
      <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6 }}>Vœux</span>
      {wishes.map((w) => (
        <p key={w.id} style={{ marginTop: 12 }}>
          <strong>{w.name}</strong> — {w.message}
        </p>
      ))}
      {sent ? (
        <p style={{ marginTop: 16 }}>Merci pour votre mot ! Il sera visible après validation.</p>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="Votre nom"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 12, borderRadius: "var(--ivory-radius-field, 12px)", border: "1px solid rgba(0,0,0,0.15)", background: "var(--ivory-card, #fff)" }}
          />
          <textarea
            placeholder="Votre mot"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{ padding: 12, borderRadius: "var(--ivory-radius-field, 12px)", border: "1px solid rgba(0,0,0,0.15)", background: "var(--ivory-card, #fff)" }}
          />
          <button
            type="submit"
            style={{ padding: 12, borderRadius: 999, border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer" }}
          >
            Envoyer un vœu
          </button>
        </form>
      )}
    </div>
  );
}
