import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { api, ApiError, setAccessToken } from "../../api/client.js";
import { useAuth } from "../../hooks/useAuth.js";

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: "CUSTOMER" | "ADMIN"; emailVerifiedAt: string | null };
}

/** TODO: inline blur validation, min-10-char live checklist — see docs-api-spec.md § Auth. */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, password });
      setAccessToken(res.accessToken);
      setUser({ id: res.user.id, email: res.user.email, role: res.user.role });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>NIVORA</h2>
        <form style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} onSubmit={onSubmit}>
          <label className="field">
            Email
            <input
              className="input"
              type="email"
              required
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
          </label>
          {error && <p style={{ color: "var(--color-accent-700)", margin: 0 }}>{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
