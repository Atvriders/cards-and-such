import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./stores/auth.js";
import "./AppShell.css";

export default function AppShell(): JSX.Element {
  const username = useAuth((s) => s.username);
  const logout = useAuth((s) => s.logout);
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Cards and Such</div>
        <nav>
          <NavLink to="/" end>Lobby</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
        </nav>
        <div className="user">
          <span data-testid="current-user">{username}</span>
          <button onClick={logout} aria-label="logout">Sign out</button>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
