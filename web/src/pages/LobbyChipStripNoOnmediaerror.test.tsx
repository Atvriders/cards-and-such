import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmediaerror` inline event-handler attribute.
 *
 * `onmediaerror` is a legacy/proprietary IDL event-handler attribute
 * associated with media-element error reporting. It is meaningless on
 * a non-media `<div role="tablist">` chip strip:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it has no media source and cannot emit a media-error
 *     event, so any `onmediaerror="..."` handler can never fire.
 *  2. Inline event-handler attributes on non-media elements pollute
 *     the DOM, trip strict CSP `script-src 'unsafe-inline'` audits,
 *     and confuse static-analysis / linter rules that expect
 *     event-handler attributes only on their owning element family.
 *  3. A stray `onmediaerror="..."` would imply the filter rail is a
 *     media surface, misleading tooling that introspects DOM
 *     event-handler provenance.
 *
 * The pin:
 *   - `track.hasAttribute("onmediaerror") === false`
 *   - `track.getAttribute("onmediaerror") === null`
 *
 * Anchor: `document.querySelector(".lobby-chips")`. The stable
 * `.lobby-chips` className scopes the pin specifically to the chip
 * filter strip rather than any sibling tablist.
 */
describe("LobbyPage — .lobby-chips tablist has no onmediaerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmediaerror attribute", () => {
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

    // The pin: NO onmediaerror attribute is authored on the chip strip.
    expect(track!.hasAttribute("onmediaerror")).toBe(false);
    expect(track!.getAttribute("onmediaerror")).toBeNull();
  });
});
