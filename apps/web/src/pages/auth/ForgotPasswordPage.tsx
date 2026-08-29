import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";

export function ForgotPasswordPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>Mot de passe oublié</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Email" type="email" style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }} />
          <Button type="submit">Envoyer le lien</Button>
        </form>
      </Card>
    </div>
  );
}
