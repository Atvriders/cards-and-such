import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onwaiting` attribute.
 *
 * `onwaiting` is a media-element event-handler IDL/content attribute,
 * fired by `HTMLMediaElement` (i.e. `<audio>` / `<video>`) when
 * playback stalls because the next frame is unavailable. It is
 * meaningless on a `<div role="tablist">`:
 *  1. The chip strip is not a media element — there is no media
 *     resource, no playback, and no waiting state to handle.
 *  2. Authored as a content attribute (`onwaiting="..."`) it would be
 *     parsed as inline event-handler script — an XSS-shaped footgun and
 *     a CSP violation under strict `script-src` policies.
 *  3. Validators (W3C Nu, html-validate) flag `onwaiting` outside of
 *     media-element contexts as misplaced, polluting CI reports.
 *
 * Why a dedicated pin: the broad LobbyChipStripNo* family covers many
 * global/legacy attributes (NoAccesskey, NoAutofocus, NoTabindex, NoId,
 * NoStyle, NoCite, NoCoords, etc.) but does not currently cover the
 * media-event-handler family. A regression that templated
 * `onwaiting="handler()"` onto the tablist would slip past every
 * existing pin.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. We assert both
 * `hasAttribute("onwaiting") === false` and
 * `getAttribute("onwaiting") === null` so any string value
 * (including empty) is caught.
 */
describe("LobbyPage — .lobby-chips tablist has no onwaiting attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onwaiting attribute", () => {
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

    // The pin: NO onwaiting attribute is authored on the chip strip.
    expect(track!.hasAttribute("onwaiting")).toBe(false);
    expect(track!.getAttribute("onwaiting")).toBeNull();
  });
});
