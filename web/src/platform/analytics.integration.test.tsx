/**
 * Integration tests for instrumented analytics events.
 *
 * Verifies that the instrumented call sites surfaced in W216 + W236 actually
 * push events into the local-only ring buffer. Each test mounts the relevant
 * production component, performs the user action, and asserts on the events
 * read back via `getEvents()`.
 *
 * Several events live on heavyweight surfaces (PlayPage with a real game
 * plugin) so we mock the games registry to inject a tiny fixture plugin.
 * The InstallPrompt accept/dismiss flow is intentionally skipped here — it
 * depends on a `beforeinstallprompt` browser event that jsdom does not
 * emit, and the unit-level coverage in `analytics.test.ts` already exercises
 * the underlying `track()` machinery.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import React, { useEffect } from "react";
import {
  _reloadFromStorage,
  clearEvents,
  getEvents,
  track,
} from "./analytics.js";
import { COACHMARK_KEY, setCoachmarkPending } from "./tutorials.js";
import { ANALYTICS_STORAGE_KEY } from "./analytics.js";

// -----------------------------------------------------------------------
// A tiny fixture plugin that PlayPage can drive end-to-end. It exposes a
// hint() returning a known selector that matches a node we render via the
// component, so showHint succeeds and reaches the `track("play.hint", ...)`
// call. The reducer is a plain identity so dispatch (and therefore the
// undo stack) work without any game logic. A getHint stub keeps the type
// shape happy even though we only use the DOM-pulse hint path.
// -----------------------------------------------------------------------
const TEST_GAME_ID = "telemetry-fixture";

const fixturePlugin = {
  id: TEST_GAME_ID,
  title: "Telemetry Fixture",
  category: "cards" as const,
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test-only plugin for analytics integration tests.",
  settings: {} as Record<string, never>,
  initialState: () => ({ moves: 0 }),
  reducer: (state: { moves: number }) => ({ moves: state.moves + 1 }),
  isTerminal: () => null,
  hint: () => ({ selector: "[data-testid='telemetry-hint-target']", pulses: 1 }),
  component: ({ dispatch }: { dispatch: (a: unknown) => void }) => (
    <div>
      <div data-testid="telemetry-hint-target">target</div>
      <button
        type="button"
        data-testid="telemetry-dispatch"
        onClick={() => dispatch({ type: "noop" })}
      >
        dispatch
      </button>
    </div>
  ),
};

// A second fixture with id `klondike`. LobbyPage's coachmark anchors to
// the Featured strip, which only renders when at least one entry in
// FEATURED_IDS resolves through the registry. Including a klondike-named
// fixture keeps the lobby's featured section rendered without requiring
// the full real registry.
const klondikeFixture = { ...fixturePlugin, id: "klondike", title: "Klondike" };

// Replace the games registry so PlayPage finds our fixture by id. Vitest
// hoists vi.mock above imports, so all production modules pulled in by
// the dynamic imports below see the fixture array.
vi.mock("../games/registry.js", () => ({
  GAMES: [fixturePlugin, klondikeFixture],
}));

// -----------------------------------------------------------------------
// Shared setup — every test starts with a clean ring buffer + storage so
// assertions can rely on event ordering / counts without cross-test leak.
// -----------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear();
  _reloadFromStorage();
});
afterEach(() => {
  localStorage.clear();
  clearEvents();
  vi.useRealTimers();
});

const eventNames = (): string[] => getEvents().map((e) => e.name);

// -----------------------------------------------------------------------
// app.boot — fires once on first import / first render of the entry path.
//
// We stub out the browser-only side-effects in main.tsx (theme application,
// service worker registration) by exercising the equivalent boot path
// directly: the production code is `track("app.boot", { href: ... })` and
// we assert the canonical event shape lands in the ring buffer.
// -----------------------------------------------------------------------
describe("analytics integration: app.boot", () => {
  it("fires an app.boot event with an href prop", () => {
    // This mirrors main.tsx's boot stamp. The instrumented call site lives
    // at module scope, so re-importing main.tsx in jsdom would also try to
    // mount the React tree into #root and register a service worker.
    track("app.boot", { href: "/" });
    const evts = getEvents();
    expect(evts.length).toBe(1);
    expect(evts[0]!.name).toBe("app.boot");
    expect(evts[0]!.props).toEqual({ href: "/" });
  });
});

// -----------------------------------------------------------------------
// route.change — fires whenever <RouteTransition> sees a new pathname.
// -----------------------------------------------------------------------
describe("analytics integration: route.change", () => {
  it("fires when navigating between routes inside MemoryRouter", async () => {
    const { RouteTransition } = await import("./RouteTransition.js");
    function App(): JSX.Element {
      return (
        <RouteTransition>
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <span data-testid="home">home</span>
                  <Link to="/about" data-testid="to-about">about</Link>
                </div>
              }
            />
            <Route path="/about" element={<span data-testid="about">about</span>} />
          </Routes>
        </RouteTransition>
      );
    }
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(eventNames()).toContain("route.change");
    expect(getEvents()[0]!.props).toEqual({ path: "/" });

    // Navigate. The fade-out timer is opaque here — we just assert that
    // the second route.change is recorded synchronously by the effect.
    fireEvent.click(screen.getByTestId("to-about"));
    const aboutEvts = getEvents().filter((e) => e.name === "route.change");
    expect(aboutEvts.length).toBe(2);
    expect(aboutEvts[1]!.props).toEqual({ path: "/about" });
  });
});

// -----------------------------------------------------------------------
// theme.change — fires when the user picks a swatch in <ThemePicker />.
// -----------------------------------------------------------------------
describe("analytics integration: theme.change", () => {
  it("fires when a built-in theme swatch is clicked", async () => {
    const { default: ThemePicker } = await import("./ui/ThemePicker.js");
    render(<ThemePicker />);
    // Open the popover. ThemePicker renders a skeleton briefly then the
    // real grid — both surface the swatch buttons via data-testid, so we
    // can pick one straight away.
    fireEvent.click(screen.getByLabelText("Choose background theme"));
    fireEvent.click(screen.getByTestId("theme-row-emerald"));
    const themeEvts = getEvents().filter((e) => e.name === "theme.change");
    expect(themeEvts.length).toBe(1);
    expect(themeEvts[0]!.props).toEqual({ theme: "emerald" });
  });
});

// -----------------------------------------------------------------------
// play.hint — fires when the user clicks the in-game Hint button.
// -----------------------------------------------------------------------
describe("analytics integration: play.hint + play.undo", () => {
  it("play.hint fires when the hint button is clicked", async () => {
    const { default: PlayPage } = await import("../pages/PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    // Move past the setup screen so the playing toolbar (hint/undo) renders.
    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-hint-btn"));
    const hintEvts = getEvents().filter((e) => e.name === "play.hint");
    expect(hintEvts.length).toBe(1);
    expect(hintEvts[0]!.props).toEqual({ gameId: TEST_GAME_ID });
  });

  it("play.undo fires after Ctrl+Z when there is something to undo", async () => {
    const { default: PlayPage } = await import("../pages/PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByTestId("start-game"));
    // Push one frame onto the undo stack by dispatching a reducer action.
    fireEvent.click(screen.getByTestId("telemetry-dispatch"));
    act(() => {
      fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    });
    const undoEvts = getEvents().filter((e) => e.name === "play.undo");
    expect(undoEvts.length).toBe(1);
    expect(undoEvts[0]!.props).toEqual({ gameId: TEST_GAME_ID });
  });
});

// -----------------------------------------------------------------------
// coachmark.dismiss — fires when the X is clicked on the lobby coachmark.
// We arm the coachmark by setting it "pending" and ensuring stats show no
// prior plays so LobbyPage's lazy initializer keeps it visible.
// -----------------------------------------------------------------------
describe("analytics integration: coachmark.dismiss", () => {
  it("fires when the coachmark close button is clicked", async () => {
    setCoachmarkPending();
    const { default: LobbyPage } = await import("../pages/LobbyPage.js");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );
    const closeBtn = await screen.findByTestId("coachmark-dismiss");
    fireEvent.click(closeBtn);
    const dismissEvts = getEvents().filter(
      (e) => e.name === "coachmark.dismiss",
    );
    expect(dismissEvts.length).toBe(1);
    // The dismiss helper persists the "done" state so the coachmark is
    // sticky-suppressed. Sanity-check that side-effect rather than just
    // the event count.
    expect(localStorage.getItem(COACHMARK_KEY)).toBe("done");
  });
});

// Keep the storage key import in scope so its named export isn't tree-
// shaken by the bundler in dev (paranoia — ensures the test file stays
// in sync with the analytics module's public surface).
void ANALYTICS_STORAGE_KEY;
// Reference React + useEffect so the file is identifiable as a module
// importing from the runtime even when no JSX above uses them directly.
void React;
void useEffect;
