import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * Pin: the inner chip-strip track `.lobby-chips` (the
 * `<div role="tablist">` filter rail rendered inside LobbyPage.tsx)
 * carries NO `oninvalid` attribute.
 *
 * `oninvalid` is a form-validation event-handler IDL attribute. It only
 * has meaningful semantics on form-associated submittable elements
 * (`<input>`, `<select>`, `<textarea>`, `<button>`, `<fieldset>`,
 * `<object>`, `<output>`) where it fires when constraint validation
 * (e.g. `checkValidity()`) reports the element as invalid. Authoring
 * `oninvalid` on a `<div role="tablist">` is meaningless: a div has no
 * constraint-validation pipeline, so the handler can never fire. It is
 * also a string-handler attack surface — an inline `oninvalid="..."`
 * would attach a string-compiled handler that lint and CSP policies
 * forbid.
 */
describe("LobbyPage — .lobby-chips tablist has no oninvalid attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inner .lobby-chips <div role=\"tablist\"> WITHOUT an oninvalid attribute", () => {
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

    // The pin: NO oninvalid attribute is authored on the chip strip.
    expect(track!.hasAttribute("oninvalid")).toBe(false);
    expect(track!.getAttribute("oninvalid")).toBeNull();
  });
});
