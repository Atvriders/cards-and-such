import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches sibling SettingsAnalyticsRowClass.test.tsx so module resolution
// stays identical across the analytics-panel test set.
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

// W1287: the analytics panel's event list is rendered as
// <ol className="settings-event-list"> — an *ordered* list because the
// ring buffer is naturally chronological and the panel renders entries
// newest-last. W1260 pinned the child row's tagName ("LI") and class but
// no existing test asserts the parent list's own tagName + class. Without
// this, swapping the <ol> for a <ul> (or stripping the class) would
// silently break list semantics + the .scss styling hook without failing
// any test until a screenshot diff caught the regression.
describe("SettingsPage analytics panel event-list tagName + className (W1287)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before each run so the list we
    // observe is the one this test emitted, not a leak from a sibling
    // describe in a parallel test file.
    clearEvents();
  });

  it("renders the populated event list as an <ol> with the settings-event-list class", () => {
    renderPage();

    // Emit a single event before opening so the populated branch (the
    // <ol>) renders rather than the analytics-empty <p> hint.
    fireEvent.click(screen.getByTestId("cardback-gallery-tartan"));
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    // The row's parent must be the <ol> — locate via the row's testid so
    // we don't depend on a class selector that this very test is pinning.
    const row = screen.getByTestId("analytics-event-0");
    const list = row.parentElement;
    expect(list).not.toBeNull();
    expect(list!.tagName).toBe("OL");
    expect(list).toHaveClass("settings-event-list");
  });
});
