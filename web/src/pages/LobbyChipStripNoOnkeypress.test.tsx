import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onkeypress` attribute.
 *
 * `onkeypress` is a legacy inline event handler attribute. It is
 * deprecated in favor of `onkeydown` / `onkeyup`, and it has never
 * been authored on the chip-strip tablist. A regression that
 * inlined an `onkeypress="..."` handler (e.g. via stringly-typed
 * markup) would slip past the existing LobbyChipStripNo* pins,
 * which cover other global/legacy attributes but not `onkeypress`
 * specifically.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The pin uses
 * BOTH `hasAttribute("onkeypress") === false` and
 * `getAttribute("onkeypress") === null` to catch any form of
 * authored value (including the empty string).
 */
describe("LobbyPage — .lobby-chips tablist has no onkeypress attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onkeypress attribute", () => {
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

    // The pin: NO onkeypress attribute is authored on the chip strip.
    expect(track!.hasAttribute("onkeypress")).toBe(false);
    expect(track!.getAttribute("onkeypress")).toBe(null);
  });
});
