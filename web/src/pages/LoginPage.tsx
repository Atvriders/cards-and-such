import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../platform/stores/auth.js";
import { UsernameSchema } from "@cards/shared";
import "./LoginPage.css";

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"claim" | "resume">("claim");
  const claim = useAuth((s) => s.claim);
  const resume = useAuth((s) => s.resume);
  const status = useAuth((s) => s.status);
  const error = useAuth((s) => s.error);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => { if (token) navigate("/"); }, [token, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = UsernameSchema.safeParse(username);
    if (!parsed.success) return;
    if (mode === "claim") await claim(parsed.data);
    else await resume(parsed.data);
  }

  return (
    <div className="login-page" data-testid="login-page">
      <h1>Cards and Such</h1>
      <form onSubmit={submit} className="login-form">
        <label>
          Username
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            aria-label="username"
          />
        </label>
        <div className="mode-switch">
          <button type="button" className={mode === "claim" ? "on" : ""} onClick={() => setMode("claim")}>Claim new</button>
          <button type="button" className={mode === "resume" ? "on" : ""} onClick={() => setMode("resume")}>Resume existing</button>
        </div>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : mode === "claim" ? "Claim" : "Resume"}
        </button>
        {error && <div role="alert" className="error">{error}</div>}
      </form>
    </div>
  );
}
