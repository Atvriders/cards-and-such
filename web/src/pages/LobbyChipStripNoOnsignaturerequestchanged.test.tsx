import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pins absence of the legacy/experimental
 * `onsignaturerequestchanged` event-handler attribute on the inner
 * chip-strip track `.lobby-chips` (the `<div role="tablist">` filter
 * rail rendered inside LobbyPage.tsx).
 *
 * The element's authored attribute set is intentionally minimal:
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *
 * `onsignaturerequestchanged` is an inline event-handler attribute
 * tied to a `signaturerequestchanged` event surface (signing /
 * credential / WebAuthn-adjacent flows). It has no meaning on a
 * `<div role="tablist">` filter rail:
 *  1. The chip strip never participates in a signature-request
 *     lifecycle — it is a category filter, not a signing UI.
 *  2. Inline `on*` handler attributes string-compile their value as
 *     JavaScript; a stray `onsignaturerequestchanged="..."` would be
 *     both an unknown-attribute lint failure AND a CSP / inline-script
 *     hazard.
 *  3. Validators (W3C Nu, html-validate) flag unknown `on*` handlers
 *     on non-listening elements as invalid, polluting CI reports.
 *
 * Why this pin is separate from the existing chip-strip `No*` pins:
 *  - None of the sibling LobbyChipStripNo* pins (NoCite, NoCoords,
 *    NoAccesskey, NoAutofocus, NoTabindex, NoLang, NoDir, NoId,
 *    NoStyle, the various NoAria*, etc.) introspect the
 *    `onsignaturerequestchanged` attribute. A regression that added
 *    `onsignaturerequestchanged="..."` would slip past every existing
 *    pin.
 *
 * The pin: `track.hasAttribute("onsignaturerequestchanged") === false`
 * AND `track.getAttribute("onsignaturerequestchanged") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a sibling
 * drawer tablist elsewhere in the tree, so anchoring on the stable
 * `.lobby-chips` className keeps the pin scoped specifically to the
 * chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onsignaturerequestchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onsignaturerequestchanged attribute", () => {
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

    // The pin: NO onsignaturerequestchanged attribute is authored on
    // the chip strip.
    expect(track!.hasAttribute("onsignaturerequestchanged")).toBe(false);
    expect(track!.getAttribute("onsignaturerequestchanged")).toBeNull();
  });
});
