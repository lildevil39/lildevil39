import { useState } from "react";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";

/** min-10-char password rule + inline blur validation is TODO — see docs-api-spec.md § Auth. */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>NIVORA</h2>
        <form
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="field">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
          </label>
          <label className="field">
            Mot de passe
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
          </label>
          <Button type="submit">Se connecter</Button>
        </form>
      </Card>
    </div>
  );
}
