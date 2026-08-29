import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";

export function ResetPasswordPage() {
  const { token } = useParams();
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>Réinitialiser le mot de passe</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} onSubmit={(e) => e.preventDefault()}>
          <input type="hidden" value={token} readOnly />
          <input placeholder="Nouveau mot de passe" type="password" style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }} />
          <Button type="submit">Valider</Button>
        </form>
      </Card>
    </div>
  );
}
