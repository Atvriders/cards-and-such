import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `onformdata` attribute.
 *
 * `onformdata` is a form-related event handler attribute that fires
 * when a `<form>`'s entry list is constructed (i.e. on form submission
 * or programmatic `new FormData(form)`). Its only meaningful host is a
 * `<form>` element. On a `<div role="tablist">` it is meaningless:
 *  1. The chip strip is a flex/scroll container of `role="tab"`
 *     buttons — it is not a form and never constructs a FormData
 *     entry list, so an `onformdata` handler would never fire.
 *  2. Validators (W3C Nu, html-validate) flag `onformdata` on a
 *     non-form element as an unknown/inapplicable event attribute.
 *  3. A stray `onformdata="..."` would imply the filter rail
 *     participates in form-data construction, confusing any tooling
 *     that introspects authored event bindings.
 *
 * The pin: `track.hasAttribute("onformdata") === false` AND
 * `track.getAttribute("onformdata") === null`.
 *
 * Anchor: `document.querySelector(".lobby-chips")`.
 */
describe("LobbyPage — .lobby-chips tablist has no onformdata attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an onformdata attribute", () => {
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

    // The pin: NO onformdata attribute is authored on the chip strip.
    expect(track!.hasAttribute("onformdata")).toBe(false);
    expect(track!.getAttribute("onformdata")).toBe(null);
  });
});
