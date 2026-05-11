import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onspeechend` attribute.
 *
 * `onspeechend` is an inline event-handler content attribute associated
 * with the Web Speech API's `SpeechRecognition` lifecycle — it fires
 * when the speech service has disconnected. It is meaningless on a
 * `<div role="tablist">` filter rail because:
 *  1. The chip strip is not a `SpeechRecognition` target — it is a
 *     scrollable flex container of `role="tab"` buttons, with no audio
 *     capture pipeline, no microphone permission flow, and no speech
 *     recognizer attached.
 *  2. Inline `on*` handler attributes on arbitrary elements are a
 *     well-known CSP / XSS smell — security scanners and CSP
 *     `script-src 'unsafe-inline'` audits flag them.
 *  3. A stray `onspeechend="..."` would imply the filter rail is
 *     wired into a speech-recognition session, confusing future
 *     readers and any tooling that greps for speech-API integrations.
 *
 * The pin: `track.hasAttribute("onspeechend") === false` AND
 * `track.getAttribute("onspeechend") === null`. Both forms are
 * asserted so a regression that authored `onspeechend=""` (empty
 * string — still `hasAttribute === true`) or any non-empty inline
 * handler payload would fail here.
 *
 * Anchor: `document.querySelector(".lobby-chips")`. There is a
 * sibling drawer tablist elsewhere in the tree, so anchoring on the
 * stable `.lobby-chips` className keeps the pin scoped specifically
 * to the chip filter strip.
 */
describe("LobbyPage — .lobby-chips tablist has no onspeechend attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onspeechend attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    // Sanity: we are looking at the chip-strip tablist track, not
    // some other element.
    expect(track!.getAttribute("role")).toBe("tablist");
    expect(track!.classList.contains("lobby-chips")).toBe(true);

    // The pin: NO onspeechend attribute is authored on the chip strip.
    expect(track!.hasAttribute("onspeechend")).toBe(false);
    expect(track!.getAttribute("onspeechend")).toBeNull();
  });
});
