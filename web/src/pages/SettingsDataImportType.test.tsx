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

// W1712: the settings-import button must carry an explicit type="button".
// Sibling tests cover the danger className on settings-clear (W1294), the
// hidden file input's accept attribute (W1241), and the analytics
// toggle/clear button types (W1351, W1554) — but no test pins the literal
// type attribute on the Import action button itself. React renders the
// default <button> type as "submit" which would submit any enclosing
// <form>; while the data section isn't currently wrapped in a form, the
// explicit attribute is what guarantees that if a future refactor wraps
// settings in a form (or moves Import into one) the click won't trigger
// an accidental submit. Pin the attribute here so that contract holds.
describe("SettingsPage settings-import button type (W1712)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-import with an explicit type=button attribute", () => {
    renderPage();

    const importBtn = screen.getByTestId("settings-import");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", masking the regression we guard.
    expect(importBtn.getAttribute("type")).toBe("button");
  });
});
