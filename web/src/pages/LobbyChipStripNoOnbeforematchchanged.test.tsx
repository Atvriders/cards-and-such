import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onbeforematchchanged` attribute.
 *
 * `onbeforematchchanged` is not a standard event-handler content
 * attribute on any element. Authoring it on the chip strip would be
 * meaningless and could only arrive as a regression — e.g. a typo
 * for a different event-handler attribute, or a stray inline-handler
 * binding leaking through templating. Inline `on*` handlers on the
 * tablist track are categorically wrong for this codebase: the chip
 * filter rail's behavior is driven by React props/state, not by
 * legacy DOM event-handler content attributes.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onbeforematchchanged attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onbeforematchchanged attribute", () => {
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

    // The pin: NO onbeforematchchanged attribute is authored on the
    // chip strip.
    expect(track!.hasAttribute("onbeforematchchanged")).toBe(false);
    expect(track!.getAttribute("onbeforematchchanged")).toBeNull();
  });
});
