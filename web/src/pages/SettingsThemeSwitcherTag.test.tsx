import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1874 — pin the theme-switcher control's literal `tagName`. The
// Background-theme picker is implemented in SettingsPage.tsx as a
// `role="radiogroup"` of `<button role="radio">` chips (one per entry in
// THEMES, plus a Custom chip). Other tests interact with `theme-row-emerald`
// via fireEvent.click() and assert side-effects, but nothing asserts the
// raw element type. A regression that swapped the chip from <button> to
// `<div role="radio">` or `<a>` would still match aria-checked / role
// assertions while silently breaking native button keyboard semantics
// (Space/Enter activation, focus ring, form association). Lock the
// production element type so a tag swap fails loudly.
describe("SettingsPage theme switcher tagName (W1874)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the [data-testid=theme-row-emerald] chip as a <button>", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const chip = getByTestId("theme-row-emerald");
    expect(chip.tagName).toBe("BUTTON");
  });
});
