import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onhashchangechanged` attribute.
 *
 * `onhashchangechanged` is not a real DOM event-handler content
 * attribute. The legitimate window-level event handler is
 * `onhashchange` (fired when the URL fragment identifier changes).
 * `onhashchangechanged` is a typo'd / duplicated-suffix variant that
 * no user agent dispatches and no spec defines. Authoring it on the
 * chip strip would be wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — even the correctly-spelled `onhashchange` belongs on
 *     `<body>` / `window`, not on a generic tablist `<div>`.
 *  2. As an unknown attribute it would be silently retained in the
 *     DOM as a string and never wired to any handler, masking the
 *     authoring mistake.
 *  3. Validators (W3C Nu, html-validate) flag unknown event-handler
 *     attributes; an `onhashchangechanged=""` would pollute CI a11y
 *     reports without delivering any behavior.
 *
 * Anchor: `document.querySelector(".lobby-chips")` to keep the pin
 * scoped to the chip filter strip rather than any sibling tablist.
 *
 * Both `hasAttribute` and `getAttribute` are asserted: `hasAttribute`
 * catches empty-string authoring (`onhashchangechanged=""`) and
 * `getAttribute === null` catches any non-null value binding.
 */
describe("LobbyPage — .lobby-chips tablist has no onhashchangechanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onhashchangechanged attribute", () => {
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

    // The pin: NO onhashchangechanged attribute is authored.
    expect(track!.hasAttribute("onhashchangechanged")).toBe(false);
    expect(track!.getAttribute("onhashchangechanged")).toBeNull();
  });
});
