import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1644 — focused coverage of the `<div className="settings-search">`
// wrapper that sits inside the SettingsPage <header> and wraps the search
// input. SettingsPage.tsx renders:
//
//   <header className="settings-header">
//     <h1>...</h1>
//     <p className="settings-subtitle">...</p>
//     <div className="settings-search">
//       <input className="settings-search-input" ... />
//     </div>
//   </header>
//
// W1634 pins the <header> className, W1575/W1586 pin the subtitle, W1595
// pins the back-to-lobby link, and W1607/W1615/W1625/W1247 pin the input's
// type/aria-label/className/placeholder. But nothing asserts the
// `settings-search` className on the wrapping <div> itself — that class is
// the CSS hook the page stylesheet uses to lay out the search box (full
// width, top margin) under the subtitle. A regression renaming or
// dropping it (e.g. a refactor that wraps the input in a shared field
// primitive) would silently break the header layout without breaking any
// other Settings test. Pin the literal class string so the contract holds.
describe("SettingsPage header search wrapper className (W1644)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("wraps the header search input in a <div class=\"settings-search\">", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const input = screen.getByTestId("settings-search-input") as HTMLInputElement;
    const wrapper = input.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper?.tagName).toBe("DIV");
    expect(wrapper?.getAttribute("class")).toBe("settings-search");
  });
});
