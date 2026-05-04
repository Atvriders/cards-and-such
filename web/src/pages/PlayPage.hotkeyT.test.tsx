/**
 * Unit test for the PlayPage "T" hotkey that toggles the per-game settings
 * popover (W756).
 *
 * Observable behavior:
 *   While the game is in the "playing" phase, pressing the unmodified `t`
 *   key flips `settingsModalOpen`, mounting the `play-settings-modal`
 *   element (PlayPage.tsx ~line 1601). Note the asymmetry: the broader
 *   power-user keydown handler short-circuits when `settingsModalOpen` is
 *   true (line ~1558), so once the modal is open `t` no longer toggles —
 *   Escape (covered by W730 in PlayPage.settingsEsc.test.tsx) is what
 *   closes it. We use Escape here for the close half of the toggle so
 *   this test reflects the real interaction model.
 *
 *   Sibling tests cover F (W736), I (W740), D (W744), R (W748),
 *   Shift+R (W753), and Esc (pause / settings-close) but none exercises
 *   the T binding's modal-open path, leaving it an untested edge.
 *
 * Strategy:
 *   - Mock the registry with a minimal one-game fixture (boolean settings
 *     schema mirrors the W730 fixture so the popover render path is real).
 *   - Advance past the setup screen so phase === "playing" and the
 *     window-level keydown handler that owns the T binding is mounted.
 *   - Dispatch the `t` key on `window`; assert the modal element appears.
 *   - Dispatch Escape; assert the modal disappears.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "hotkey-t-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Hotkey T Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for the T-hotkey settings-popover toggle test.",
    settings: settingsSchema,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    component: ({ state }: { state: State }) => (
      <div>
        <span data-testid="fx-count">{state.count}</span>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't ship — null-stub keeps any
// stray render path side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage T hotkey toggles settings popover (W756)", () => {
  it("pressing T while playing opens the settings modal; Escape closes it", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Move past the setup screen so phase === "playing" and the
    // window-level keydown handler that owns the T binding is mounted.
    fireEvent.click(screen.getByTestId("start-game"));

    // Sanity: modal starts closed.
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();

    // Toggle ON via the unmodified T keybinding.
    fireEvent.keyDown(window, { key: "t" });
    expect(screen.getByTestId("play-settings-modal")).toBeTruthy();

    // Escape closes — T is intentionally inert while the modal is open
    // because the broader hotkey handler short-circuits when
    // settingsModalOpen is true.
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("play-settings-modal")).toBeNull();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
