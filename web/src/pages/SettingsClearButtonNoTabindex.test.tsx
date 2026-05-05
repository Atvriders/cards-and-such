import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsPage.test.tsx setup so module resolution
// stays identical (otherwise other exports would tree-shake out).
vi.mock("../platform/sounds.js", async () => {
  const actual = await vi.importActual<typeof import("../platform/sounds.js")>(
    "../platform/sounds.js",
  );
  return { ...actual, playSound: vi.fn() };
});

import SettingsPage from "./SettingsPage.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

// W2324: the settings-clear "Clear all" destructive button is a real
// <button> rendered in normal document flow, so it must rely on the
// browser's intrinsic tab order — no explicit `tabindex` attribute.
// Sibling tests pin its type="button" (W2317), danger className modifier
// (W1294), and overall button class contract (W1872-class), but none
// guard against a future regression that adds a stray tabindex (e.g.
// tabindex="-1" to "hide" the destructive action, or tabindex="0" added
// reflexively as if it were a div). Either would silently break keyboard
// reachability or duplicate the button's natural tab stop position.
// Pin the attribute's *absence* so that contract holds.
describe("SettingsPage settings-clear button has no tabindex (W2324)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-clear without a tabindex attribute", () => {
    renderPage();

    const btn = screen.getByTestId("settings-clear");
    // Use hasAttribute, not the .tabIndex DOM property — the latter
    // coerces a missing attribute to 0 for focusable elements, which
    // would mask the regression we guard against.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});
