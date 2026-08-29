import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { api, ApiError } from "../../api/client.js";

export function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/auth/register", { email, password, firstName, lastName, locale: "FR" });
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 24px" }}>
      <Card style={{ width: 420 }}>
        <h2>Créer mon compte</h2>
        {done ? (
          <p>
            Compte créé — un email de vérification a été envoyé. Redirection vers la connexion…
          </p>
        ) : (
          <form style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }} onSubmit={onSubmit}>
            <input
              placeholder="Prénom"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
            <input
              placeholder="Nom"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
            <input
              placeholder="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
            <input
              placeholder="Mot de passe (min. 10 caractères)"
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 10, border: "1px solid var(--color-border)", borderRadius: 4 }}
            />
            {error && <p style={{ color: "var(--color-accent-700)", margin: 0 }}>{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Création…" : "Créer mon compte"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
