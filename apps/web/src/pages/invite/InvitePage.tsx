import { useParams } from "react-router-dom";

/**
 * Recreate design/Invitation-Islem-Akram.html pixel-faithfully in this
 * component (React + TS + Vite, ivory register tokens) — it is a design
 * *reference*, not code to copy in. Order: sealed envelope → tap wax seal
 * (flaps open, music starts on that gesture — never autoplay) → names →
 * date → message → photo → countdown → programme → lieu + Maps → galerie
 * → RSVP → vœux. No login. dir="rtl" when wedding_invitations.locale=AR.
 * Server-rendered og:title/og:image/og:description are an SSR/edge concern,
 * not something a client-only Vite SPA can do — see ARCHITECTURE.md for
 * where that piece should live once the web app has a server layer.
 */
export function InvitePage() {
  const { slug } = useParams();
  return (
    <div style={{ padding: 48, textAlign: "center" }}>
      <p>TODO: recreate design/Invitation-Islem-Akram.html for slug "{slug}".</p>
    </div>
  );
}
