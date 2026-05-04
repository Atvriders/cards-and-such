import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsAnalytics tests so module resolution stays
// identical between this file and the rest of the suite.
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

// W1301: each analytics row wraps its timestamp/name/props text in a <code>
// element so the monospace styling kicks in and the ISO timestamp doesn't
// reflow mid-line. W1260 pinned the row's <li> tag + class, but no existing
// test asserts the inner <code> wrapper. A refactor that swapped <code> for
// <span> would silently regress the visual treatment until a screenshot diff
// caught it. Pin the tagName here.
describe("SettingsPage analytics panel event row inner <code> tag (W1301)", () => {
  beforeEach(() => {
    localStorage.clear();
    clearEvents();
  });

  it("wraps the row's timestamp + name text in a <code> element", () => {
    renderPage();

    // Card-back toggle synchronously calls track() — same trigger the sibling
    // analytics row tests use, so the row content shape stays comparable.
    fireEvent.click(screen.getByTestId("cardback-gallery-tartan"));
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    const row = screen.getByTestId("analytics-event-0");
    // The row's only child element is the <code> wrapper — assert by walking
    // firstElementChild rather than a raw querySelector so a stray sibling
    // (e.g. a future timestamp split-out) would also fail this assertion.
    const inner = row.firstElementChild;
    expect(inner).not.toBeNull();
    expect(inner!.tagName).toBe("CODE");
  });
});
