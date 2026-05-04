import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

// W1562: the analytics panel's Refresh button must carry an explicit
// type="button". Without it, React renders the default <button> which
// submits enclosing forms — and while SettingsPage doesn't currently wrap
// this control in a <form>, omitting the attribute would silently regress
// that guarantee if a future refactor moved the panel under one. The
// sibling W1351 test pins the same contract on the analytics-toggle and
// W1554 pins it on analytics-clear; this closes the gap on the third
// button in the dev-only event-log row.
describe("SettingsPage analytics refresh button type (W1562)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so any pre-existing
    // events can't influence the panel's render path.
    clearEvents();
  });

  it("renders the analytics refresh with an explicit type=button attribute", () => {
    renderPage();

    // Panel is collapsed by default — open it so analytics-refresh mounts.
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    const refresh = screen.getByTestId("analytics-refresh");
    // Use getAttribute, not the .type DOM property — the latter coerces
    // missing/invalid values to "submit", which would mask the regression
    // we're guarding against. We want the *literal* attribute on the markup.
    expect(refresh.getAttribute("type")).toBe("button");
  });
});
