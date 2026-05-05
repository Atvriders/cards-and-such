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

// W2317: the settings-clear "Clear all" destructive button must carry an
// explicit type="button" attribute. Sibling tests cover its danger
// className modifier (W1294), the className contract (W1872-class), the
// settings-import button type (W1712), and the analytics clear/refresh
// button types (W1554) — but no test pins the literal `type` attribute
// on the destructive Clear-all button itself. A bare <button> defaults to
// type="submit" in HTML, which would submit any enclosing <form>; while
// the data section is not currently inside a form, the explicit attribute
// is what guarantees a future refactor wrapping Settings in a <form> can
// not accidentally turn the Clear-all click into a form submission (which
// would, in this app, trigger a full-page navigation back to the lobby
// before the localStorage.clear() effect is allowed to run, masking the
// destructive action and surprising the user). Pin the attribute here so
// that contract holds.
describe("SettingsPage settings-clear button type (W2317)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-clear with an explicit type=button attribute", () => {
    renderPage();

    const btn = screen.getByTestId("settings-clear");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", masking the regression we guard.
    expect(btn.getAttribute("type")).toBe("button");
  });
});
