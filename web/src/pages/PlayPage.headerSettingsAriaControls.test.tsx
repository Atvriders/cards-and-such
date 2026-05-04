/**
 * Unit test for the PlayPage header settings button aria-controls
 * contract (W982) — pinning the *intentional absence* of the attribute.
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2145) renders a `<button data-testid="play-settings-btn">`
 *   in the header iconbar whenever `phase === "playing"` and the active
 *   plugin advertises a non-empty settings schema. The button advertises
 *   the popover relationship to AT via `aria-haspopup="dialog"` (pinned by
 *   W906) plus `aria-expanded` that toggles in lock-step with the modal
 *   (the dirty-dot / dirty-class are dynamic). It deliberately carries NO
 *   `aria-controls` attribute, however: the play-settings-modal is rendered
 *   conditionally as a *modal dialog* — when closed, the dialog node does
 *   not exist in the DOM, so a static `aria-controls="play-settings-modal"`
 *   would point at a non-existent id (NVDA reports "Bad reference" when
 *   the target is missing) and a dynamic value would change between renders
 *   (also undesirable per WAI-ARIA APG: aria-controls is not required when
 *   aria-haspopup + aria-expanded already convey the disclosure semantics
 *   for a freshly-mounted modal).
 *
 *   This is the settings-button analog of the W980 absent-aria-controls
 *   contract on `play-info-btn` (info popover is also conditionally
 *   rendered). Pin the absence so a well-meaning a11y refactor that adds
 *   `aria-controls="play-settings-modal"` doesn't silently introduce a
 *   dangling-id reference. The pattern matches W939's absent-attribute
 *   strategy (`expect(...getAttribute(name)).toBeNull()`) and the sibling
 *   W945 absent-keyshortcuts test on the same button.
 *
 * Strategy mirrors PlayPage.headerSettingsKeyshortcuts.test.tsx (W945) for
 * the fixture and W939 (toolbarPrimaryRole) for the absent-attribute
 * assertion:
 *   - Hoisted minimal fixture plugin with a non-empty settings schema so
 *     the iconbar branch (`Object.keys(plugin.settings).length > 0`)
 *     renders the button.
 *   - Mount at `/play/:gameId`, click start-game to enter playing phase.
 *   - Locate the button via its testid.
 *   - Assert getAttribute("aria-controls") === null. ONE assertion,
 *     narrow scope; the modal-closed snapshot is the realistic surface
 *     a screen-reader user lands on when first focusing the button.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// The settings schema must be non-empty so the iconbar branch
// (`Object.keys(plugin.settings).length > 0`) renders the button.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-settings-aria-controls-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Settings Aria-Controls Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only plugin for the header settings-button absent-aria-controls test.",
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

// Confetti pulls in canvas APIs jsdom doesn't ship; null-stub keeps the
// render side-effect-free.
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

describe("PlayPage header settings button absent aria-controls contract (W982)", () => {
  it("does not advertise aria-controls on the settings button (modal is conditionally rendered; haspopup+expanded carry disclosure semantics)", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Settings button only mounts in the playing phase, so advance past
    // the setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-settings-btn") as HTMLButtonElement;

    // Pin the deliberate ABSENCE of aria-controls. The play-settings-modal
    // is rendered conditionally — when closed (the surface the user lands
    // on when first focusing the button) the dialog id does not exist in
    // the DOM, so a static aria-controls would dangle. A future a11y
    // refactor that adds `aria-controls="play-settings-modal"` here
    // should be a deliberate spec change (and pair with making the modal
    // unconditionally rendered or hidden=true), not a silent drift —
    // flip this test red if the contract changes. Mirrors W980 for the
    // info button.
    expect(btn.getAttribute("aria-controls")).toBeNull();
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
