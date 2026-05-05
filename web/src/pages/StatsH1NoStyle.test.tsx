import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2109: StatsPage's page-level `<h1>Your stats</h1>` is authored as a bare
 * `<h1>` element with no inline `style` prop. Sibling tests pin attribute
 * absence for `id` and `class`, but no test currently locks down the
 * absence of an inline `style` attribute on the page heading. A refactor
 * that introduces e.g. `<h1 style={{ color: theme.fg }}>` — even a
 * conditional one that often reduces to an empty object — would emit a
 * stray `style` attribute on the H1 and quietly bypass the global h1
 * styling contract enforced by `StatsPage.css`. Inline styles on a
 * top-level page heading are a code smell: they take precedence over the
 * cascade and make typography drift hard to diagnose. Pin the attribute
 * absence (`heading.hasAttribute("style") === false`) so the bare-h1
 * contract is locked at the DOM level for the `style` attribute too, in
 * line with the existing `id`/`class` attribute-absence pins.
 */
describe("StatsPage header — h1 has no style attribute (attribute absence)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2109: page-level h1 'Your stats' has no `style` attribute in the DOM", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin attribute absence — no inline style on the page-level heading.
    expect(heading.hasAttribute("style")).toBe(false);
  });
});
