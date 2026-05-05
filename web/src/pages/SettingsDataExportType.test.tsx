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

// W1723: the settings-export button must carry an explicit type="button".
// Sibling W1712 pins the same attribute on settings-import; this test
// applies the same contract to the Export action button. React renders
// the default <button> type as "submit" which would submit any enclosing
// <form>; while the data section isn't currently wrapped in a form, the
// explicit attribute is what guarantees that if a future refactor wraps
// settings in a form (or moves Export into one) the click won't trigger
// an accidental submit. Pin the attribute here so that contract holds.
describe("SettingsPage settings-export button type (W1723)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-export with an explicit type=button attribute", () => {
    renderPage();

    const exportBtn = screen.getByTestId("settings-export");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", masking the regression we guard.
    expect(exportBtn.getAttribute("type")).toBe("button");
  });
});
