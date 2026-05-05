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

// W2481: the settings-clear "Clear all" destructive button is located
// purely via its `data-testid` selector and styled by class — there is
// no need for an `id` attribute, and adding one risks colliding with a
// global `#settings-clear` selector elsewhere or anchoring the URL bar
// to the destructive control. Sibling tests already pin its tagName
// (W2383), type=button (W2317), tabindex absence (W2324), exact
// className (W1872), and danger-class modifier (W1294). Nothing guards
// the *absence* of an `id` attribute, so a regression that introduces
// `id="settings-clear"` (e.g. for a stray <label htmlFor> hookup) would
// pass unnoticed. Pin the absence here.
describe("SettingsPage settings-clear button has no id (W2481)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-clear without an id attribute", () => {
    renderPage();

    const btn = screen.getByTestId("settings-clear");
    // Use hasAttribute rather than reading `.id`, which coerces a
    // missing attribute to the empty string "" — that would still
    // pass a `=== ""` check even if someone set `id=""` explicitly,
    // so the attribute-presence query is the stricter contract.
    expect(btn.hasAttribute("id")).toBe(false);
  });
});
