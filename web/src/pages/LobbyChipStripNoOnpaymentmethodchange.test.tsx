import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onpaymentmethodchange` attribute.
 *
 * `onpaymentmethodchange` is the inline event-handler form of the
 * Payment Request API's `paymentmethodchange` event, which fires on a
 * `PaymentRequest` instance when the user switches payment methods
 * mid-flow. It has no meaning whatsoever on a `<div role="tablist">`
 * chip filter rail:
 *  1. The chip strip is a category filter rail of `role="tab"`
 *     buttons — it is not a `PaymentRequest`, payment sheet, or any
 *     checkout surface, so there is no payment method to change.
 *  2. As an inline event-handler attribute, a stray
 *     `onpaymentmethodchange="..."` would be a JavaScript code sink
 *     (any string value is parsed and compiled into a handler),
 *     making it a CSP-violating XSS vector if user-controlled data
 *     ever flowed into the attribute.
 *  3. Validators and linters treat unrecognized `on*` attributes on
 *     non-applicable elements as authoring mistakes, polluting CI
 *     reports.
 *
 * The pin: `track.hasAttribute("onpaymentmethodchange") === false`
 * and `track.getAttribute("onpaymentmethodchange") === null`. A
 * regression that templated `onpaymentmethodchange="..."` onto the
 * chip strip would fail here.
 *
 * Anchor: `document.querySelector(".lobby-chips")` (rather than
 * `getByRole("tablist")`) keeps the pin scoped specifically to the
 * chip filter strip, since other tablists exist elsewhere in the tree.
 */
describe("LobbyPage — .lobby-chips tablist has no onpaymentmethodchange attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onpaymentmethodchange attribute", () => {
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

    // The pin: NO onpaymentmethodchange attribute is authored on the
    // chip strip. Both `hasAttribute` and `getAttribute` are checked
    // to lock down both presence and value.
    expect(track!.hasAttribute("onpaymentmethodchange")).toBe(false);
    expect(track!.getAttribute("onpaymentmethodchange")).toBe(null);
  });
});
