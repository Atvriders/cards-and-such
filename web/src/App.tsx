import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./platform/AppShell.js";
import { RequireAuth } from "./platform/RequireAuth.js";
import LoginPage from "./pages/LoginPage.js";
import LobbyPage from "./pages/LobbyPage.js";
import PlayPage from "./pages/PlayPage.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";
import PlayOnlinePage from "./pages/PlayOnlinePage.js";
import Connect4Online from "./games/connect-4/Connect4Online.js";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/play/:gameId" element={<PlayPage />} />
        <Route path="/play/:gameId/online" element={<PlayOnlinePage />} />
        <Route path="/play/connect-4/online/:roomId" element={<Connect4Online />} />
        <Route path="/play/:gameId/online/:roomId" element={<PlayOnlinePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
