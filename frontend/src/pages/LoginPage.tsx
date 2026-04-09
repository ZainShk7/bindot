import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarFront, Loader2, LogIn, UserPlus } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Btn, Card, FieldLabel, Input } from "../components/ui";
import { AppRoute } from "../routes";

export function LoginPage() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("admin@bindot.local");
  const [password, setPassword] = useState("admin123");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) navigate(AppRoute.Root, { replace: true });
  }, [token, navigate]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const data = await api<{ token: string }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      navigate(AppRoute.Root, { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bindot-app">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div className="bindot-brand-mark">
          <CarFront size={20} strokeWidth={2} aria-hidden />
        </div>
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text-h)",
            }}
          >
            BinDot
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Vehicle booking</div>
        </div>
      </header>
      <div className="bindot-auth-wrap">
        <div className="bindot-auth-inner">
          {error ? (
            <div
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 12,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#7f1d1d",
              }}
            >
              {error}
            </div>
          ) : null}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            <Card
              title={mode === "signup" ? "Create admin" : "Sign in"}
              icon={mode === "signup" ? UserPlus : LogIn}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Btn
                  variant={mode === "signup" ? "primary" : "secondary"}
                  icon={UserPlus}
                  onClick={() => setMode("signup")}
                  style={{ flex: 1 }}
                >
                  Signup
                </Btn>
                <Btn
                  variant={mode === "login" ? "primary" : "secondary"}
                  icon={LogIn}
                  onClick={() => setMode("login")}
                  style={{ flex: 1 }}
                >
                  Login
                </Btn>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={{ display: "grid", gap: 6 }}>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </div>
              <div style={{ marginTop: 12 }}>
                <Btn
                  onClick={submit}
                  disabled={busy}
                  icon={busy ? undefined : LogIn}
                  style={{ padding: "10px 14px" }}
                >
                  {busy ? (
                    <>
                      <Loader2 className="bindot-spin" size={16} aria-hidden />
                      Please wait…
                    </>
                  ) : mode === "signup" ? (
                    "Signup"
                  ) : (
                    "Login"
                  )}
                </Btn>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
