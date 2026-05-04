import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
import { clearEvents } from "../platform/analytics.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

// W1554: the analytics-clear button must carry an explicit type="button".
// Existing tests cover the click behavior (it wipes the ring buffer) and the
// toggle's type attribute, but no test pins the literal type attribute on
// the Clear control itself. Without it, React renders the default <button>
// type which submits enclosing forms — and while the panel isn't currently
// inside a <form>, omitting the attribute would silently regress that
// guarantee if a future refactor wrapped settings in a form.
describe("SettingsPage analytics-clear button type (W1554)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so prior events don't
    // influence the panel's render path.
    clearEvents();
  });

  it("renders analytics-clear with an explicit type=button attribute", () => {
    renderPage();

    // The Clear button only mounts once the panel is open.
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    const clearBtn = screen.getByTestId("analytics-clear");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", masking the regression we guard.
    expect(clearBtn.getAttribute("type")).toBe("button");
  });
});
