import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsAnalytics* tests so module resolution stays
// identical across the analytics-panel test set.
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

// W1735: the expanded analytics dev panel is a generic <div> — it has no
// landmark role of its own, so screen readers rely on the explicit
// aria-label="Local analytics event log" to announce the region when the
// user tabs into it from the Show event log toggle. Existing tests pin the
// panel's existence, the inner row/list/code structure, and the toggle's
// own aria-expanded flip, but none assert this label. A refactor that
// dropped or renamed the prop would silently break the announcement
// without any test failure.
describe("SettingsPage analytics panel aria-label (W1735)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Module-scoped ring buffer — wipe before mount so the panel mounts in
    // its empty state, but the aria-label is rendered regardless.
    clearEvents();
  });

  it("renders the analytics panel with the local-only aria-label", () => {
    renderPage();

    // Panel is collapsed by default — open it so analytics-panel mounts.
    fireEvent.click(screen.getByTestId("analytics-toggle"));

    const panel = screen.getByTestId("analytics-panel");
    // The label must match the human-readable string the screen reader
    // announces. Pinning the exact text guards against a copy-edit that
    // would silently change accessibility output.
    expect(panel.getAttribute("aria-label")).toBe("Local analytics event log");
  });
});
