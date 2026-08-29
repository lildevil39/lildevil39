/** 4-column footer per README § Landing screen spec. */
export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "48px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 32,
        fontSize: 14,
        color: "var(--color-text)",
      }}
    >
      <div>
        <strong style={{ fontFamily: "var(--font-display)" }}>NIVORA</strong>
        <p>Create. Personalize. Impress.</p>
      </div>
      <div>Services</div>
      <div>Entreprise</div>
      <div>Contact</div>
    </footer>
  );
}
