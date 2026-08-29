import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button.js";

export function Header() {
  const { t } = useTranslation();
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 48px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Link to="/" style={{ fontFamily: "var(--font-display)", fontSize: 22, textDecoration: "none" }}>
        NIVORA
      </Link>
      <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <Link to="/#services">{t("nav.services")}</Link>
        <Link to="/#pricing">{t("nav.pricing")}</Link>
        <Link to="/login">{t("nav.login")}</Link>
        <Link to="/register">
          <Button>{t("nav.register")}</Button>
        </Link>
      </nav>
    </header>
  );
}
