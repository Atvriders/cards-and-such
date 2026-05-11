import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ontransitionrun` attribute.
 *
 * `ontransitionrun` is a global event-handler content attribute that
 * fires when a CSS transition begins running (after any `transition-delay`
 * has elapsed but before the first transition tick). Authoring it
 * inline on the chip strip would be wrong because:
 *  1. Inline event-handler content attributes (`on*="..."`) are a
 *     string-to-code coupling that bypasses React's synthetic event
 *     system and CSP `script-src` policies that forbid
 *     `unsafe-inline`. Any value would either be dead code (no global
 *     handler resolves it) or a CSP violation.
 *  2. React renders event handlers via property assignment, not as
 *     HTML attributes — so the presence of a literal `ontransitionrun`
 *     attribute in the DOM would indicate a stray
 *     `{...{"ontransitionrun": "..."}}` spread or `setAttribute` call,
 *     never an intentional `onTransitionRun` JSX prop.
 *  3. The chip strip is a horizontally scrollable flex container of
 *     filter tabs; it has no transition-driven business logic that
 *     should hook the `transitionrun` lifecycle event from inline
 *     markup.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. A sibling drawer
 * tablist exists elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className (rather than `getByRole("tablist")`) keeps
 * the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no ontransitionrun attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ontransitionrun attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO ontransitionrun attribute is authored on the chip
    // strip. A regression that adds `ontransitionrun=""` or any
    // string handler binding would fail here.
    expect(track!.hasAttribute("ontransitionrun")).toBe(false);
    expect(track!.getAttribute("ontransitionrun")).toBeNull();
  });
});
