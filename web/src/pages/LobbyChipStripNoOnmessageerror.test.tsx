import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onmessageerror` attribute.
 *
 * `onmessageerror` is a global event-handler IDL attribute that fires
 * when a `MessageEvent` cannot be deserialized — it is only meaningful
 * on `Window`, `Worker`, `MessagePort`, `BroadcastChannel`, and similar
 * messaging endpoints. On a static `<div role="tablist">` chip strip
 * it is meaningless: the element is not a message receiver and will
 * never dispatch a `messageerror` event. Authoring an inline
 * `onmessageerror="..."` would only create a noisy global event-handler
 * binding that no user agent invokes for this DOM node.
 *
 * Anchor: `document.querySelector(".lobby-chips")` — scoped to the
 * stable chip-strip className rather than `getByRole("tablist")` to
 * avoid colliding with any sibling tablist elsewhere in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onmessageerror attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onmessageerror attribute", () => {
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

    // The pin: NO onmessageerror attribute is authored on the chip strip.
    expect(track!.hasAttribute("onmessageerror")).toBe(false);
    expect(track!.getAttribute("onmessageerror")).toBeNull();
  });
});
