import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2452 — the chip strip's LEFT overflow scroll-arrow button is rendered
 * without an `id` attribute. The button is a decorative scroll affordance,
 * not an addressable landmark, so it must not collide with the global
 * id-namespace nor become a stable hash-link target.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftTagName.test.tsx (W2435) pins the BUTTON tagName,
 *    LobbyChipArrowLeftType.test.tsx (W2313) pins `type="button"`,
 *    LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins `tabIndex={-1}`,
 *    and LobbyChipArrowLeftAria.test.tsx (W1319) pins the aria-label.
 *    None of those would notice if a stray `id` regressed onto this
 *    button.
 *  - The mirror pin LobbyChipArrowRightNoId.test.tsx (W2444) covers the
 *    RIGHT arrow only. There are TWO chip-strip arrows in the JSX, and a
 *    refactor that accidentally introduced an `id="lobby-chips-arrow"`
 *    on the markup template (or via a shared sub-component) would
 *    produce a duplicate-id document-validity violation for both arrows
 *    — invisible to every other left-arrow pin.
 *  - Several other lobby chrome elements have explicit no-id pins for
 *    the same reason (LobbyChipStripNoId, LobbyChipsWrapNoId,
 *    LobbyChipAllNoId, LobbyChipDiceNoId, LobbyChipArrowRightNoId).
 *
 * The button is rendered with `hidden` toggled by overflow geometry, so
 * we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow has no id (W2452)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the left scroll-arrow without an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const left = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--left",
    );
    expect(left).not.toBeNull();

    // hasAttribute is the literal-attribute check: it returns true even
    // for an empty `id=""`, which getAttribute would surface as "" and
    // the .id IDL property would surface as "" (indistinguishable from
    // "no id" via the property mirror alone). Pinning hasAttribute
    // catches both "id was added" and "id was added but left empty".
    expect(left!.hasAttribute("id")).toBe(false);
    // Belt-and-braces: the IDL mirror should also be the empty string,
    // which is what jsdom reports when the attribute is absent.
    expect(left!.id).toBe("");
  });
});
