/**
 * Unit test for the PlayPage header hint button data-tooltip attribute
 * contract (W953 — analog of W935 for redo and the implicit W947-style
 * coverage for undo).
 *
 * Observable behavior:
 *   PlayPage.tsx (~line 2027) renders a `<button data-testid="play-hint-btn">`
 *   in the header iconbar whenever (a) `phase === "playing"` and (b) the
 *   user has hints enabled (`cards-hints-enabled` localStorage flag) and
 *   (c) the active plugin defines a `hint()` function. The button carries
 *   a `data-tooltip="Hint"` attribute that the toolbar's CSS hover-tooltip
 *   layer reads to render the floating label on pointer hover (the native
 *   `title="..."` attribute on this same button is dynamic — it switches
 *   to "Hint (ready in Ns)" when the cooldown is active or "No hint
 *   available for this game" when the plugin lacks `hint()`. The
 *   `data-tooltip` attribute, in contrast, is statically "Hint", so the
 *   hover label stays stable across cooldown transitions).
 *
 *   Sibling tests cover other facets of the same button:
 *     - W922 (headerHintButton) pins tagName/type/aria-label/glyph
 *     - W496 (hint) covers the click-to-pulse flow
 *     - hintCooldown / hintGating / hintSettingDisabled cover the gating
 *   None of them assert anything about `data-tooltip` — so a regression
 *   that swapped it for "Show hint" (drift), made it dynamic to mirror
 *   `title=` (breaking the stable hover label), or dropped the attribute
 *   entirely (no hover label at all) would slip past every existing test.
 *
 * Strategy mirrors W935 (PlayPage.headerRedoTooltip.test.tsx) — single
 * focused attribute pin — but reuses the W922 hint-button fixture shape
 * because the hint button needs `plugin.hint` defined and the
 * `cards-hints-enabled` flag set before it will mount.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture — vi.hoisted runs before vi.mock factories evaluate.
// `hint()` must be defined so the button is rendered as enabled (the
// `disabled={!plugin.hint || ...}` branch evaluates to false). The
// `cards-hints-enabled` flag is set in beforeEach to open the gate.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "header-hint-tooltip-fixture";
  type State = { count: number };
  type Action = { type: string };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Header Hint Tooltip Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description:
      "Test-only counter plugin for the header hint data-tooltip test.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ count: 0 }),
    reducer: (s: State, _a: Action): State => s,
    isTerminal: () => null,
    // hint() must exist (any value) so the `disabled={!plugin.hint || ...}`
    // gate evaluates false and the button mounts in its enabled shape. The
    // selector returned never matches — but this test never clicks the
    // button, it only inspects the static `data-tooltip` attribute.
    hint: () => ({ selector: "[data-testid='nonexistent']" }),
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
  // Hints are gated by a Settings → Gameplay toggle (`cards-hints-enabled`).
  // Make the on-state explicit so this test isn't subject to default
  // changes elsewhere.
  localStorage.setItem("cards-hints-enabled", "true");
  // Disable the cooldown gate — `data-tooltip` itself is static so the
  // cooldown wouldn't change it, but turning the cooldown off also keeps
  // the rest of the rendered shape stable in case future drift in the
  // surrounding markup affects testid lookup.
  localStorage.setItem("cards-hint-cooldown", "false");
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("PlayPage header hint button data-tooltip contract (W953)", () => {
  it("pins data-tooltip='Hint' so the CSS hover-tooltip layer surfaces a stable label across cooldown/disabled transitions", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");

    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Hint button only mounts in the playing phase, so advance past the
    // setup screen first.
    fireEvent.click(screen.getByTestId("start-game"));

    const btn = screen.getByTestId("play-hint-btn") as HTMLButtonElement;

    // CSS hover-tooltip contract — the toolbar's tooltip layer renders a
    // floating label by reading `data-tooltip`. Drift to "Show hint"
    // (verbose copy), making it dynamic to mirror the `title=` cooldown
    // text, or losing the attribute entirely (no hover label at all)
    // would all be invisible to every other test on this button.
    expect(btn.getAttribute("data-tooltip")).toBe("Hint");
  });
});

// React reference keeps this an unambiguous JSX module under strict
// tsconfigs that don't auto-import the runtime in tests.
void React;
