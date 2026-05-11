import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onslotassign` attribute.
 *
 * `onslotassign` is the event-handler content attribute for the
 * `slotchange`-adjacent `slotassign` event, only meaningful on
 * `<slot>` elements participating in shadow DOM slot assignment.
 * On a plain `<div role="tablist">` it is meaningless: the chip
 * strip is not a `<slot>`, it does not participate in shadow tree
 * slotting, and no user agent will fire a `slotassign` event at
 * it. Authoring it on the chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons rendered in the light DOM. It is not a shadow-DOM
 *     `<slot>`, so there is no slot-assignment lifecycle.
 *  2. Inline event-handler content attributes (`on*=`) are a known
 *     XSS sink and are blocked by strict CSP policies. A stray
 *     `onslotassign="..."` would either be dead code or, worse,
 *     an injection vector if the value were ever interpolated
 *     from user data.
 *  3. Validators flag unknown/inapplicable event-handler
 *     attributes on non-host elements, polluting CI accessibility
 *     and lint reports.
 *
 * The pin: `track.hasAttribute("onslotassign") === false` AND
 * `track.getAttribute("onslotassign") === null`. Both primitives
 * are asserted so a regression that authors `onslotassign=""`
 * (empty value, still an authored attribute) is caught by
 * `hasAttribute`, while any non-null string value is caught by
 * `getAttribute`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on
 * the stable `.lobby-chips` className keeps the pin scoped
 * specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onslotassign attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onslotassign attribute", () => {
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

    // The pin: NO onslotassign attribute is authored on the chip strip.
    expect(track!.hasAttribute("onslotassign")).toBe(false);
    expect(track!.getAttribute("onslotassign")).toBeNull();
  });
});
