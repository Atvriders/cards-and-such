import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforedragstart` attribute.
 *
 * `onbeforedragstart` is a legacy IE-era event-handler content
 * attribute that was never standardised in HTML5 and is not
 * recognised by modern user agents. Authoring it on the chip strip
 * would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — drag-and-drop is not part of its interaction model.
 *  2. Validators flag unknown `on*` content attributes as invalid,
 *     and the modern drag lifecycle uses `dragstart` (not
 *     `beforedragstart`), so a stray `onbeforedragstart=""` binding
 *     would be dead code that confuses linters and CSP audits.
 *  3. Inline event-handler content attributes are a CSP/XSS hazard;
 *     pinning their absence keeps the surface auditable.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforedragstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforedragstart attribute", () => {
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

    // The pin: NO onbeforedragstart attribute is authored on the
    // chip strip. Both `hasAttribute` and `getAttribute` are asserted
    // because the contract is total absence — neither an empty
    // binding nor any handler string should appear.
    expect(track!.hasAttribute("onbeforedragstart")).toBe(false);
    expect(track!.getAttribute("onbeforedragstart")).toBeNull();
  });
});
