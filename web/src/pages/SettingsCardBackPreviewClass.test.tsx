import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsPage tests so module resolution stays
// identical between this file and the rest of the suite.
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

// W1395: each card-back gallery tile renders an inner <span class="card-back-preview">
// before the label text. The `.card-back-preview` CSS rule (SettingsPage.css)
// is what gives the swatch its rounded preview chip — without that class the
// gradient on `style.background` would render as an unstyled inline span. Other
// tests pin aria-checked / data-testid on the outer button and the gallery's
// radiogroup wrapper, but no existing test asserts the inner preview class.
// A refactor that renamed the class (e.g. `.card-back-chip`) would silently
// drop styling until a screenshot diff caught it.
describe("SettingsPage card-back gallery inner preview class (W1395)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an inner <span class=\"card-back-preview\"> chip on each gallery tile", () => {
    renderPage();

    const tile = screen.getByTestId("cardback-gallery-tartan");
    // firstElementChild walks past any text nodes — the preview chip is
    // intentionally the first DOM child so the swatch reads gradient-then-label.
    const inner = tile.firstElementChild;
    expect(inner).not.toBeNull();
    expect(inner!.tagName).toBe("SPAN");
    expect(inner!.classList.contains("card-back-preview")).toBe(true);
  });
});
