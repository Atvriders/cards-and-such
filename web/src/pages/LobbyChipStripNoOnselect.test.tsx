import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onselect` attribute.
 *
 * `onselect` is a legacy inline-event-handler attribute whose only
 * meaningful hosts are form controls that emit a `select` event
 * (`<input type="text">`, `<input type="search">`, `<textarea>`).
 * On a `<div role="tablist">` it is meaningless: divs do not emit a
 * native `select` event, so any handler bound via `onselect="..."`
 * would never fire. Authoring it on the chip strip would be wrong
 * because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a text-selection-capable form control,
 *     so the inline `select` event handler is dead code.
 *  2. Inline event-handler attributes are a CSP/XSS hazard — any
 *     `onselect="..."` string is executed as JavaScript by the
 *     parser, bypassing CSP `script-src` policies that omit
 *     `'unsafe-inline'`.
 *  3. React idiom is `onSelect={fn}` (camelCase prop) which compiles
 *     to a synthetic event listener, never to a serialized DOM
 *     `onselect=""` attribute. A regression that emitted the
 *     lowercase attribute would indicate someone authored raw HTML
 *     containing the inline handler.
 *
 * The pin: `track.hasAttribute("onselect") === false` AND
 * `track.getAttribute("onselect") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onselect attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onselect attribute", () => {
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

    // The pin: NO onselect attribute is authored on the chip strip.
    expect(track!.hasAttribute("onselect")).toBe(false);
    expect(track!.getAttribute("onselect")).toBeNull();
  });
});
