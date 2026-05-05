import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsExportButton* tests so module resolution
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

// W2368: the settings-export "Export all" action is a real, native
// <button> element rendered inside the Data section. Sibling tests
// already pin its type="button" (SettingsDataExportType), its exact
// className "settings-action" (SettingsExportButtonClass), and the
// absence of a stray tabindex (SettingsExportButtonNoTabindex). None
// of them, however, guard against a regression where the element
// itself is swapped for a non-button (e.g. an <a role="button"> or
// a <div> styled to look like a button). Such a swap would silently
// break native button semantics — implicit role, default form
// submission ergonomics, Space/Enter activation — even while every
// pinned attribute remains intact. Pin the tagName so the contract
// "this is a real <button>" is enforced.
describe("SettingsPage settings-export button tagName (W2368)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-export as a native <button> element", () => {
    renderPage();

    const btn = screen.getByTestId("settings-export");
    // tagName is upper-cased by HTML for non-namespaced elements; pin
    // the exact value so an SVG/foreign element swap also fails fast.
    expect(btn.tagName).toBe("BUTTON");
  });
});
