import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2435 — the chip strip's LEFT overflow scroll-arrow is rendered as a
 * native <button> element, not a <div>, <span>, or <a> styled to look
 * like one.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightTagName.test.tsx (W2371) pins the RIGHT arrow's
 *    tagName as "BUTTON", but the two arrows are independently declared
 *    in the JSX with their own literal opening tag. A regression that
 *    swapped only the LEFT arrow to a <div>/<span> while leaving the
 *    right arrow intact (e.g. via a careless refactor) would slip past
 *    the right-arrow tagName assertion.
 *  - LobbyChipArrowLeftType.test.tsx (W2313) pins the LEFT arrow's
 *    `type="button"` attribute, but `type` is meaningful only on a
 *    <button>/<input> tag. A regression that swapped the surrounding
 *    element to a <div> while keeping a stale `type` attribute would
 *    still satisfy that test (the attribute would be present-but-inert)
 *    yet would silently strip native button semantics — focusability,
 *    Enter/Space activation, and the implicit "button" role used by
 *    assistive tech.
 *  - LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins `tabIndex={-1}`,
 *    which is intentionally NEGATIVE on this arrow. If the tagName
 *    silently degraded to a non-button (e.g. <div>), the missing
 *    intrinsic interactivity would not be flagged by the tabIndex
 *    assertion — `tabIndex=-1` is valid on any HTMLElement.
 *  - LobbyChipArrowLeftAria.test.tsx (W1319) pins the left arrow's
 *    `aria-label`, which does not require a button tagName either.
 *
 * The button is rendered with `hidden` toggled by overflow geometry
 * (and starts as hidden when the strip has not been scrolled), so we
 * resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow tagName (W2435)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the left scroll-arrow as a native <button> element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const left = document.querySelector<HTMLElement>(
      ".lobby-chips-arrow--left",
    );
    expect(left).not.toBeNull();

    // tagName is uppercase in HTML documents (jsdom mirrors browsers),
    // so an exact "BUTTON" comparison pins both the tag identity and
    // catches any regression that swapped the element to <div>/<span>/<a>.
    expect(left!.tagName).toBe("BUTTON");
  });
});
