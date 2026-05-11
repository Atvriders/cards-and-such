import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onafterprintchanged` attribute.
 *
 * `onafterprintchanged` is not a standard HTML event handler attribute.
 * The standard print-related window events are `onbeforeprint` and
 * `onafterprint`. Even if a non-standard `onafterprintchanged` were
 * authored on the chip-strip tablist, it would be meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not involved in print lifecycle at all.
 *  2. Print events are window-level, not element-level, so authoring
 *     a print handler on an arbitrary `<div>` is a no-op.
 *  3. Validators flag unknown `on*` attributes as invalid, polluting
 *     CI accessibility / lint reports.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped to the chip
 * filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onafterprintchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onafterprintchanged attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: confirm we are looking at the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO `onafterprintchanged` attribute is authored.
    expect(track!.hasAttribute("onafterprintchanged")).toBe(false);
    expect(track!.getAttribute("onafterprintchanged")).toBeNull();
  });
});
