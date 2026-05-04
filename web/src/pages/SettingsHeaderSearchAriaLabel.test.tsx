import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1615 — focused coverage of the `aria-label` attribute on the SettingsPage
// header search input. SettingsPage.tsx renders the filter control as
// `<input type="search" ... aria-label="Search settings" ...>` inside
// `.settings-search`. W1247 (SettingsSearchPlaceholder) pins the visual
// `placeholder="Search settings…"` copy and W1607 (SettingsHeaderSearchType)
// pins the `type="search"` attribute, but nothing asserts the literal
// `aria-label` string. Pinning it matters because the input has no visible
// <label> — the aria-label is the only accessible name a screen reader will
// announce, so a regression that drops or renames the attribute (e.g. while
// migrating to a shared TextField that expects a `label` prop) would silently
// leave the input announced as just "search" with no context. Use
// getAttribute so the assertion fails on a value drift instead of falling
// back to the placeholder or other implicit naming.
describe("SettingsPage header search input aria-label (W1615)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels the header search input with aria-label=\"Search settings\"", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const search = screen.getByTestId(
      "settings-search-input",
    ) as HTMLInputElement;
    expect(search.getAttribute("aria-label")).toBe("Search settings");
  });
});
