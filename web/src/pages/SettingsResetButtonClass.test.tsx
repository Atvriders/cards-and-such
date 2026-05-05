import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches sibling SettingsDataImportType.test.tsx so module resolution
// stays identical with the rest of the Settings test fixtures.
vi.mock("../platform/sounds.js", async () => {
  const actual = await vi.importActual<typeof import("../platform/sounds.js")>(
    "../platform/sounds.js",
  );
  return { ...actual, playSound: vi.fn() };
});

import SettingsPage from "./SettingsPage.js";

// W1872 — focused coverage of the EXACT className string on the data-section
// "Clear all" reset-data button (`data-testid="settings-clear"`). Sibling
// test SettingsDataClearDanger.test.tsx (W1294) asserts the button HAS the
// `settings-action` and `settings-action--danger` classes (substring/list
// matchers via `toHaveClass`), but nothing pins the *exact* className string.
// A regression that added an extra space, a stray modifier, or reordered
// the tokens would slip past the existing list-based assertions while still
// breaking style-attribute equality / snapshot diffs / cascade ordering.
// Pin the literal className here so that contract holds end-to-end.
describe("SettingsPage reset-data button className equality (W1872)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-clear with className exactly 'settings-action settings-action--danger'", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const btn = screen.getByTestId("settings-clear");
    expect(btn.className).toBe("settings-action settings-action--danger");
  });
});
