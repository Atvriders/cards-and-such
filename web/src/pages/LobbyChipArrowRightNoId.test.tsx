import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2444 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * without an `id` attribute. The button is a decorative scroll affordance,
 * not an addressable landmark, so it must not collide with the global
 * id-namespace nor become a stable hash-link target.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightTagName.test.tsx (W2371) pins the BUTTON tagName,
 *    LobbyChipArrowRightType.test.tsx (W1408) pins `type="button"`, and
 *    LobbyChipArrowRightTabIndex.test.tsx (W1746) pins `tabIndex={-1}`.
 *    LobbyPage.test.tsx (~L2271) reads the right arrow's `aria-label` and
 *    `hidden` flag. None of those tests would notice if a stray `id`
 *    attribute regressed onto this button.
 *  - There are TWO chip-strip arrows on the page (left + right). If a
 *    refactor accidentally introduced an `id="lobby-chips-arrow"` (or
 *    similar) on the markup template, both arrows would render with the
 *    SAME id — a duplicate-id document validity violation that breaks
 *    label-for/aria-labelledby resolution and is invisible to all of the
 *    other right-arrow pins. Several other lobby chrome elements have
 *    explicit no-id pins for exactly this reason
 *    (LobbyChipStripNoId, LobbyChipsWrapNoId, LobbyChipAllNoId,
 *     LobbyChipDiceNoId, etc.).
 *
 * The button is rendered with `hidden` toggled by overflow geometry, so
 * we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip RIGHT arrow has no id (W2444)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // hasAttribute is the literal-attribute check: it returns true even
    // for an empty `id=""`, which getAttribute would surface as "" and
    // the .id IDL property would surface as "" (indistinguishable from
    // "no id" via the property mirror alone). Pinning hasAttribute
    // catches both "id was added" and "id was added but left empty".
    expect(right!.hasAttribute("id")).toBe(false);
    // Belt-and-braces: the IDL mirror should also be the empty string,
    // which is what jsdom reports when the attribute is absent.
    expect(right!.id).toBe("");
  });
});
