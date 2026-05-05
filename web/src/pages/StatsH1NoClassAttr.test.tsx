import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2097: StatsPage's page-level `<h1>Your stats</h1>` is authored as a bare
 * `<h1>` element — no `className=""` prop, no class attribute at all in the
 * emitted DOM. W1144/W1570 already pin `heading.className === ""` and
 * `classList.length === 0`, but those checks both pass even when the
 * element carries `class=""` (an empty string class attribute), because
 * `className` and `classList` reflect a present-but-empty `class`
 * identically to a wholly absent one. A refactor that adds e.g.
 * `<h1 className={extraClass}>` where `extraClass` evaluates to `""` (a
 * conditional class hook reduced to an empty string) would silently start
 * emitting `<h1 class="">…</h1>` while still satisfying the existing
 * className-equality and classList-length pins. That stray empty `class`
 * attribute is a code smell — it telegraphs a class hook that isn't fully
 * wired up and invites future drift. Pin the *attribute absence*
 * (`heading.hasAttribute("class") === false`) so the bare-h1 contract is
 * locked at the DOM-attribute level, not just the reflected-property
 * level.
 */
describe("StatsPage header — h1 has no class attribute (attribute absence)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2097: page-level h1 'Your stats' has no `class` attribute in the DOM", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading.tagName).toBe("H1");
    // Pin attribute absence — distinct from `className === ""` which also
    // matches a present-but-empty `class=""` attribute.
    expect(heading.hasAttribute("class")).toBe(false);
  });
});
