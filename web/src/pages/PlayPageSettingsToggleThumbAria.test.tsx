/**
 * Unit test for PlayPage settings boolean toggle-thumb element (W1494).
 *
 * Each boolean field in the settings modal renders a `<label class=
 * "play-settings-row play-settings-row--bool">` whose nested `<span
 * class="play-settings-toggle">` wraps the checkbox input followed by a
 * decorative `<span class="play-settings-toggle-thumb" aria-hidden="true"
 * />` (PlayPage.tsx ~line 2309). The thumb span is the visible "knob"
 * that slides when the toggle is flipped — pure CSS chrome.
 *
 * Sibling tests pin the boolean row's outer label and the input testid
 * (`settingsBooleanLabel`, `settingsBooleanField`), but no test pins the
 * thumb span itself: not its class, not its `aria-hidden="true"`
 * attribute (which keeps screen readers from announcing decorative
 * geometry as a separate node), and not the fact that it lives as a
 * sibling of the checkbox inside the `.play-settings-toggle` wrapper.
 * A refactor that dropped the thumb, removed `aria-hidden`, or moved it
 * outside the toggle wrapper would silently regress the toggle's
 * visual/AT contract.
 *
 * Strategy mirrors PlayPage.settingsFieldsStructural.test.tsx:
 *   - vi.hoisted fixture plugin with one boolean settings field so the
 *     boolean branch (and therefore the thumb) renders.
 *   - Mount PlayPage at /play/:gameId, click `start-game`, then open the
 *     settings modal via `play-settings-btn`.
 *   - Locate the boolean field's testid, walk up to the wrapping
 *     `.play-settings-toggle`, and assert the thumb span exists, has the
 *     expected class, and carries `aria-hidden="true"`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "settings-toggle-thumb-fixture";
  const settingsSchema = {
    deluxe: { kind: "boolean" as const, default: false, label: "Deluxe" },
  };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Settings Toggle Thumb Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Test-only plugin for settings toggle-thumb element test.",
    settings: settingsSchema,
    initialState: () => ({ moves: 0 }),
    reducer: (state: { moves: number }) => state,
    isTerminal: () => null,
    component: () => <div data-testid="fixture-game">game</div>,
  };
  return { TEST_GAME_ID, fixturePlugin };
});

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

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

describe("PlayPage settings boolean toggle-thumb (W1494)", () => {
  it("renders a `<span.play-settings-toggle-thumb aria-hidden='true'>` inside the toggle wrapper", async () => {
    const { default: PlayPage } = await import("./PlayPage.js");
    render(
      <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}`]}>
        <Routes>
          <Route path="/play/:gameId" element={<PlayPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("start-game"));
    fireEvent.click(screen.getByTestId("play-settings-btn"));

    const modal = screen.getByTestId("play-settings-modal");
    // Locate the boolean checkbox by its derived testid, then walk up
    // to the `.play-settings-toggle` wrapper that hosts both the
    // checkbox and the decorative thumb sibling.
    const checkbox = modal.querySelector(
      '[data-testid="play-setting-deluxe"]',
    );
    expect(checkbox).not.toBeNull();
    const toggleWrapper = checkbox?.closest(".play-settings-toggle");
    expect(toggleWrapper).not.toBeNull();

    const thumb = toggleWrapper?.querySelector(".play-settings-toggle-thumb");
    // Pin existence — a refactor that dropped the thumb removes the
    // visible knob from the toggle.
    expect(thumb).not.toBeNull();
    // Pin tag: a `<span>` keeps the inline-decorative semantics.
    expect((thumb as HTMLElement).tagName).toBe("SPAN");
    // Pin the bare class — CSS rules key off the exact selector.
    expect((thumb as HTMLElement).classList.contains("play-settings-toggle-thumb")).toBe(true);
    // Pin aria-hidden: the thumb is decorative chrome and must not be
    // announced as a separate AT node alongside the checkbox itself.
    expect((thumb as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });
});

void React;
