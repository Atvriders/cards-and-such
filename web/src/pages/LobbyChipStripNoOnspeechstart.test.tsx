import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin — the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onspeechstart` attribute.
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
 * `onspeechstart` is not a standard DOM event handler attribute. The
 * Web Speech API surfaces speech-recognition lifecycle events
 * (`speechstart`, `speechend`, `start`, `end`, `result`, etc.) on
 * `SpeechRecognition` instances via `addEventListener` or via the
 * `onspeechstart` IDL property on that specific JS object — NOT as an
 * HTML content attribute on arbitrary DOM elements. Authoring
 * `onspeechstart="..."` on a `<div role="tablist">` is wrong because:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a `SpeechRecognition` host, so the attribute
 *     is meaningless to user agents.
 *  2. Validators (W3C Nu, html-validate) flag unknown `on*` attributes
 *     on HTML elements, polluting CI accessibility/lint reports.
 *  3. A stray `onspeechstart="..."` would imply the filter rail emits
 *     speech-recognition events, confusing tooling that introspects
 *     DOM event-handler provenance.
 *
 * The pin: `track.hasAttribute("onspeechstart") === false` and
 * `track.getAttribute("onspeechstart") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className (rather than `getByRole("tablist")`)
 * keeps the pin scoped specifically to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onspeechstart attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onspeechstart attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element. The pin only carries weight if the element
    // is in fact the role="tablist" filter rail.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onspeechstart attribute is authored on the chip strip.
    expect(track!.hasAttribute("onspeechstart")).toBe(false);
    expect(track!.getAttribute("onspeechstart")).toBe(null);
  });
});
