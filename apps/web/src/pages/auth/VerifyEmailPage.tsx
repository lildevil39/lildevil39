import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card.js";

/** TODO: call POST /auth/verify-email with {token} on mount, show success/error state. */
export function VerifyEmailPage() {
  const { token } = useParams();
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>Vérification de l'email</h2>
        <p>Token: {token}</p>
      </Card>
    </div>
  );
}
