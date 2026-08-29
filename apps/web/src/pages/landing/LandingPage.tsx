import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { SERVICE_KEYS } from "@nivora/shared";

/**
 * TODO: full landing per README § Screens: hero with .plate drift image,
 * how-it-works rail, portfolio masonry, pricing table with TND⇄EUR toggle,
 * testimonials, FAQ accordions, contact form. This is the structural shell.
 */
export function LandingPage() {
  const { t } = useTranslation();
  return (
    <>
      <section style={{ padding: "96px 48px", maxWidth: 900 }}>
        <h1 style={{ fontSize: 64, lineHeight: 1.02 }}>{t("landing.hero_title")}</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 18, maxWidth: "56ch" }}>
          {t("landing.hero_subtitle")}
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          <Link to="/create">
            <Button>{t("landing.cta_primary")}</Button>
          </Link>
          <Link to="/#services">
            <Button variant="ghost">{t("landing.cta_secondary")}</Button>
          </Link>
        </div>
      </section>

      <section id="services" style={{ padding: "0 48px 96px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {SERVICE_KEYS.map((key, i) => (
            <Card key={key}>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-accent)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 style={{ marginTop: 12 }}>{key}</h3>
              <p>à partir de — TND</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
