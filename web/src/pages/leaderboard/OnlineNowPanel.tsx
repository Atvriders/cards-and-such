import { useAuth } from "../../platform/stores/auth.js";
import { useLobbyPresence } from "../../platform/api/ws.js";
import "./OnlineNowPanel.css";

export function OnlineNowPanel(): JSX.Element {
  const token = useAuth((s) => s.token);
  const { online, users, connected } = useLobbyPresence(token);
  return (
    <aside className="online-now" aria-label="online users">
      <header>
        <strong>{online}</strong> online {connected ? "" : "(connecting…)"}
      </header>
      <ul>
        {users.map((u) => (
          <li key={u.username}>
            <span className="name">{u.username}</span>
            <span className="where">{u.game ?? "in lobby"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
