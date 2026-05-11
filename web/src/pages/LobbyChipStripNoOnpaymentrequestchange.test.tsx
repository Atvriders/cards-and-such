import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin absence of the `onpaymentrequestchange` attribute on the inner
 * chip-strip track `.lobby-chips` (the `<div role="tablist">` filter
 * rail rendered inside LobbyPage.tsx).
 *
 * `onpaymentrequestchange` is a Payment Request API event handler
 * attribute. It has no meaningful host on a `<div role="tablist">`:
 * the chip strip is a flex/scroll container of `role="tab"` buttons,
 * not a payment-related element. Authoring it on the chip strip would
 * be wrong because:
 *  1. The chip strip has no payment context — it is a filter rail.
 *  2. Validators flag unknown event-handler attributes as invalid,
 *     polluting CI accessibility reports.
 *  3. A stray `onpaymentrequestchange="..."` would be dead inline
 *     JS, a CSP risk, and confusing to anyone reading the DOM.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onpaymentrequestchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpaymentrequestchange attribute", () => {
    render(
      <MemoryRouter initialEntries={["/lobby"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const track = document.querySelector<HTMLElement>(".lobby-chips");
    expect(track).not.toBeNull();

    expect(track!.hasAttribute("onpaymentrequestchange")).toBe(false);
    expect(track!.getAttribute("onpaymentrequestchange")).toBe(null);
  });
});
