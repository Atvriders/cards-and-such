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

// W2326: the settings-import "Import" action button is a real
// <button> rendered in normal document flow within the Data section,
// so it must rely on the browser's intrinsic tab order — no explicit
// `tabindex` attribute. Sibling tests pin its type="button"
// (SettingsDataImportType) and class contract (SettingsImportButtonClass),
// but none guard against a future regression that adds a stray tabindex
// (e.g. tabindex="-1" to "hide" the action while the hidden file input
// is focused, or tabindex="0" added reflexively as if it were a div).
// Either would silently break keyboard reachability or duplicate the
// button's natural tab stop position. Pin the attribute's *absence* so
// that contract holds. Mirrors the W2325 sibling test for settings-export
// and the W2324 sibling test for settings-clear.
describe("SettingsPage settings-import button has no tabindex (W2326)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-import without a tabindex attribute", () => {
    renderPage();

    const btn = screen.getByTestId("settings-import");
    // Use hasAttribute, not the .tabIndex DOM property — the latter
    // coerces a missing attribute to 0 for focusable elements, which
    // would mask the regression we guard against.
    expect(btn.hasAttribute("tabindex")).toBe(false);
  });
});
