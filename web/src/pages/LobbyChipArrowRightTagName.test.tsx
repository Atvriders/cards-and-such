import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2371 — the chip strip's RIGHT overflow scroll-arrow is rendered as a
 * native <button> element, not a <div>, <span>, or <a> styled to look
 * like one.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightType.test.tsx (W1408) pins the right arrow's
 *    `type="button"` attribute, but `type` is meaningful only on a
 *    <button>/<input> tag. A regression that swapped the surrounding
 *    element to a <div> while keeping a stale `type` attribute would
 *    still satisfy that test (the attribute would be present-but-inert)
 *    yet would silently strip native button semantics — focusability,
 *    Enter/Space activation, and the implicit "button" role used by
 *    assistive tech.
 *  - LobbyChipArrowRightTabIndex.test.tsx (W1746) pins `tabIndex={-1}`,
 *    which is intentionally NEGATIVE on this arrow. If the tagName
 *    silently degraded to a non-button (e.g. <div>), the missing
 *    intrinsic interactivity would not be flagged by the tabIndex
 *    assertion — `tabIndex=-1` is valid on any HTMLElement.
 *  - LobbyPage.test.tsx (~L2271) reads the right arrow's `aria-label`
 *    and `hidden` flag, neither of which require a button tagName.
 *
 * The button is rendered with `hidden` toggled by overflow geometry,
 * so we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip RIGHT arrow tagName (W2371)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow as a native <button> element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // tagName is uppercase in HTML documents (jsdom mirrors browsers),
    // so an exact "BUTTON" comparison pins both the tag identity and
    // catches any regression that swapped the element to <div>/<span>/<a>.
    expect(right!.tagName).toBe("BUTTON");
  });
});
