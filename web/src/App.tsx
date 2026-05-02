import { Routes, Route } from "react-router-dom";
import AppShell from "./platform/AppShell.js";
import { RequireAuth } from "./platform/RequireAuth.js";
import { RouteTransition } from "./platform/RouteTransition.js";
import "./platform/RouteTransition.css";
import LoginPage from "./pages/LoginPage.js";
import "./styles/games.css";
import LobbyPage from "./pages/LobbyPage.js";
import CategoryPage from "./pages/CategoryPage.js";
import PlayPage from "./pages/PlayPage.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";
import DailyPage from "./pages/DailyPage.js";
import PlayOnlinePage from "./pages/PlayOnlinePage.js";
import AboutPage from "./pages/AboutPage.js";
import PrivacyPage from "./pages/PrivacyPage.js";
import CreditsPage from "./pages/CreditsPage.js";
import SettingsPage from "./pages/SettingsPage.js";
import StatsPage from "./pages/StatsPage.js";
import SearchPage from "./pages/SearchPage.js";
import NotFoundPage from "./pages/NotFoundPage.js";
import OfflinePage from "./pages/OfflinePage.js";
import Connect4Online from "./games/connect-4/Connect4Online.js";
import UnoLikeOnline from "./games/uno-like/UnoLikeOnline.js";

export default function App(): JSX.Element {
  return (
    <RouteTransition>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/category/:cat" element={<CategoryPage />} />
          <Route path="/play/:gameId" element={<PlayPage />} />
          <Route path="/play/:gameId/online" element={<PlayOnlinePage />} />
          <Route path="/play/connect-4/online/:roomId" element={<Connect4Online />} />
          <Route path="/play/uno-like/online/:roomId" element={<UnoLikeOnline />} />
          <Route path="/play/:gameId/online/:roomId" element={<PlayOnlinePage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </RouteTransition>
  );
}
