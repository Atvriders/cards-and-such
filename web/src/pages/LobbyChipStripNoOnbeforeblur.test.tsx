import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforeblur` attribute.
 *
 * `onbeforeblur` is a legacy / non-standard IE-era event handler
 * attribute. It is not part of the modern HTML spec and is not honored
 * by any current browser. Authoring it on the chip strip would be wrong
 * because:
 *  1. It is a no-op on every modern user agent — any handler bound
 *     through it would silently never fire, masking real focus-loss
 *     bugs.
 *  2. Validators flag unknown `on*` attributes, polluting CI reports.
 *  3. Legitimate "before blur" semantics on the chip strip should be
 *     implemented with React synthetic events (`onBlur` /
 *     `onBlurCapture`) on the actual focusable `role="tab"` buttons,
 *     not via a legacy attribute on the tablist container.
 *
 * Anchor: `document.querySelector(".lobby-chips")` keeps the pin
 * scoped to the chip filter strip and not the sibling drawer tablist.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforeblur attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforeblur attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: this is the chip-strip tablist track.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onbeforeblur attribute is authored on the chip strip.
    expect(track!.hasAttribute("onbeforeblur")).toBe(false);
    expect(track!.getAttribute("onbeforeblur")).toBe(null);
  });
});
