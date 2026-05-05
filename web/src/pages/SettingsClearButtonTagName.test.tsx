import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock platform sounds so SettingsPage doesn't poke Web Audio in jsdom —
// matches the sibling SettingsClearButton* tests so module resolution
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

// W2383: the settings-clear "Clear all" destructive action is a real,
// native <button> element rendered inside the Data section. Sibling
// tests already pin its type="button" (W2317), the absence of a stray
// tabindex (W2324), the danger className modifier (W1294), and the
// exact className contract (W1872). None of them, however, guard
// against a regression where the element itself is swapped for a
// non-button (e.g. an <a role="button"> or a <div> styled to look
// like a button). Such a swap would silently break native button
// semantics — implicit role, Space/Enter activation, default
// keyboard reachability, the type="button" attribute itself becoming
// a no-op — even while every pinned attribute remains intact on the
// new element. The destructive Clear-all action is the *worst* place
// to lose those guarantees: it wipes every `cards-` key on the
// device. Pin the tagName so the contract "this is a real <button>"
// is enforced. Mirrors the W2368 sibling test for settings-export.
describe("SettingsPage settings-clear button tagName (W2383)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders settings-clear as a native <button> element", () => {
    renderPage();

    const btn = screen.getByTestId("settings-clear");
    // tagName is upper-cased by HTML for non-namespaced elements; pin
    // the exact value so an SVG/foreign element swap also fails fast.
    expect(btn.tagName).toBe("BUTTON");
  });
});
