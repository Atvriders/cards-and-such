import { Routes, Route } from "react-router-dom";
import AppShell from "./platform/AppShell.js";
import { RequireAuth } from "./platform/RequireAuth.js";
import { RouteTransition } from "./platform/RouteTransition.js";
import { ErrorBoundary } from "./platform/ErrorBoundary.js";
import "./platform/RouteTransition.css";
import "./platform/ErrorBoundary.css";
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
import ShareHandlerPage from "./pages/ShareHandlerPage.js";
import DevErrorTestPage from "./pages/DevErrorTestPage.js";
import Connect4Online from "./games/connect-4/Connect4Online.js";
import UnoLikeOnline from "./games/uno-like/UnoLikeOnline.js";

// DEV-only fault-injection route. Vite replaces `import.meta.env.DEV` with a
// literal `true` / `false` at build time so the production bundle tree-shakes
// the page out entirely — there's nothing left to navigate to.
const DEV_BUILD =
  typeof import.meta !== "undefined" &&
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

export default function App(): JSX.Element {
  // Top-level boundary: a slightly more generic fallback for catastrophic
  // failures in the route layer (router, AppShell, layout). Per-page
  // boundaries (e.g. PlayPage's plugin guard) handle scoped crashes so
  // the lobby/header/footer stay alive.
  return (
    <ErrorBoundary
      scope="app"
      title="The app hit a snag"
      hint="An unexpected error escaped a page. Reload to recover, or report the bug if it keeps happening."
    >
      <RouteTransition>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/share-handler" element={<ShareHandlerPage />} />
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
            {DEV_BUILD && (
              <Route path="/dev/error-test" element={<DevErrorTestPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </RouteTransition>
    </ErrorBoundary>
  );
}
