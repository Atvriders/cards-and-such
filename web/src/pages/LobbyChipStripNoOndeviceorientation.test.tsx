import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `ondeviceorientation` attribute.
 *
 * `ondeviceorientation` is a Window-scoped event handler IDL attribute
 * that fires when fresh DeviceOrientationEvent data is available from
 * the underlying gyroscope/accelerometer stack. It is a content
 * attribute only on `<body>` (where it proxies to `window`), not on
 * arbitrary HTML elements like a `<div role="tablist">`. Authoring it
 * on the chip strip would be wrong because:
 *  1. The chip strip is not the document body — `ondeviceorientation`
 *     authored on a `<div>` is silently ignored by every user agent,
 *     so it is dead weight in the DOM.
 *  2. It implies the filter rail subscribes to physical device tilt /
 *     orientation telemetry, which is privacy-sensitive (Permissions
 *     Policy `gyroscope`, `accelerometer`) and entirely orthogonal to a
 *     category-filter tablist.
 *  3. Static analyzers (html-validate, axe, eslint-plugin-jsx-a11y)
 *     flag stray inline event handlers on non-body elements as
 *     suspicious — a regression that templated `ondeviceorientation`
 *     onto the strip would pollute CI reports.
 *
 * The pin: `track.hasAttribute("ondeviceorientation") === false` and
 * `track.getAttribute("ondeviceorientation") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — keeps the pin
 * scoped to the chip filter strip (not a sibling drawer tablist).
 */
describe("LobbyPage — .lobby-chips tablist has no ondeviceorientation attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an ondeviceorientation attribute", () => {
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

    // The pin: NO ondeviceorientation attribute is authored on the
    // chip strip. A regression that adds `ondeviceorientation=""` or
    // any handler binding would fail here.
    expect(track!.hasAttribute("ondeviceorientation")).toBe(false);
    expect(track!.getAttribute("ondeviceorientation")).toBeNull();
  });
});
