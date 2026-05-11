import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onreadystatechange` attribute.
 *
 * `onreadystatechange` is a legacy event-handler content attribute
 * historically associated with `XMLHttpRequest` and, on the DOM side,
 * with `Document.readyState` transitions. It is meaningless on a
 * `<div role="tablist">`:
 *  1. The chip strip is a static layout container of `role="tab"`
 *     buttons — it has no ready-state lifecycle of its own.
 *  2. Authoring an inline event-handler attribute would punch a hole
 *     in the app's CSP posture and serialize JS into the markup.
 *  3. Validators flag unknown event-handler attributes on arbitrary
 *     elements; CI accessibility/lint reports would be polluted.
 *
 * Anchor: `document.querySelector(".lobby-chips")` (stable className,
 * avoids the sibling drawer tablist).
 *
 * The pin: both `hasAttribute("onreadystatechange") === false` and
 * `getAttribute("onreadystatechange") === null`. A regression that
 * added any inline onreadystatechange handler — empty string or JS
 * payload — would fail here.
 */
describe("LobbyPage — .lobby-chips tablist has no onreadystatechange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onreadystatechange attribute", () => {
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

    // The pin: NO onreadystatechange attribute is authored.
    expect(track!.hasAttribute("onreadystatechange")).toBe(false);
    expect(track!.getAttribute("onreadystatechange")).toBeNull();
  });
});
