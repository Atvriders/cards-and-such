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

// W1260: an analytics row is rendered as <li className="settings-event-item">.
// The className is the hook the .scss styling targets, but no existing test
// asserts the row carries it — only its data-testid is covered. Without an
// assertion, a careless rename in the component wouldn't fail any test until
// the visual styling regressed in a screenshot diff.
describe("SettingsPage analytics panel event row className (W1260)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before each run so the row we observe
    // is the one this test emitted, not a leak from a sibling describe.
    clearEvents();
  });

  it("tags each rendered event row with the settings-event-item class", () => {
    renderPage();

    // Card-back toggle is the cleanest event source — its useEffect calls
    // track("setting.change", { key: "cardBack", value }) synchronously, no
    // confirm dialog or async work in the way.
    fireEvent.click(screen.getByTestId("cardback-gallery-tartan"));

    // Open the panel *after* the event so refreshEventLog() picks it up on
    // the first read — saves us a Refresh click.
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    const row = screen.getByTestId("analytics-event-0");
    expect(row).toHaveClass("settings-event-item");
    // Belt-and-braces: the row must be an <li>, not a <div> or <p>, because
    // the parent <ol className="settings-event-list"> assumes list semantics
    // for screen readers.
    expect(row.tagName).toBe("LI");
  });
});
