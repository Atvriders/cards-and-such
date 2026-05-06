import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2819 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * without a `name` attribute. The button is a decorative scroll affordance
 * that exists outside any <form>, so a `name` would only invite confusion:
 *  - browsers expose named buttons via `form.elements[name]` and via the
 *    legacy `document.<name>` named-access proxy, which would reserve a
 *    global identifier for a non-form chrome element;
 *  - if a future refactor ever wraps the lobby chrome in a <form>, a
 *    spurious `name` would cause the arrow to be submitted as form data;
 *  - the LEFT arrow has the same constraint, so an accidental shared
 *    `name` (e.g. `name="chip-arrow"`) would create two same-named
 *    submitters in form payloads.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowRightTagName.test.tsx (W2371) pins the BUTTON tagName,
 *    LobbyChipArrowRightType.test.tsx (W1408) pins `type="button"`,
 *    LobbyChipArrowRightTabIndex.test.tsx (W1746) pins `tabIndex={-1}`,
 *    LobbyChipArrowRightNoId.test.tsx (W2444) pins absence of `id`,
 *    LobbyChipArrowRightNoStyle.test.tsx pins absence of inline style,
 *    LobbyChipArrowRightNoDraggable.test.tsx pins absence of draggable.
 *    None of those tests would notice if a stray `name` attribute
 *    regressed onto this button.
 *  - The matching no-name pins exist for the chip family
 *    (LobbyChipAllNoName, LobbyChipArcadeNoName, LobbyChipBoardNoName,
 *     LobbyChipCardsNoName, LobbyChipDiceNoName, LobbyChipFavoritesNoName,
 *     LobbyChipHiddenNoName, LobbyChipRecentlyPlayedNoName,
 *     LobbyChipSolitaireNoName, LobbyChipStripNoName,
 *     LobbyChipTopRatedNoName, LobbyDrawerToggleNoName), so the right
 *     arrow is a documented gap in the no-name coverage matrix.
 *
 * The button is rendered with `hidden` toggled by overflow geometry, so
 * we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip RIGHT arrow has no name (W2819)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without a name attribute", () => {
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
    // for an empty `name=""`, which getAttribute would surface as "" and
    // the .name IDL property would surface as "" (indistinguishable from
    // "no name" via the property mirror alone). Pinning hasAttribute
    // catches both "name was added" and "name was added but left empty".
    expect(right!.hasAttribute("name")).toBe(false);
    // Belt-and-braces: the IDL mirror should also be the empty string,
    // which is what jsdom reports when the attribute is absent.
    expect(right!.name).toBe("");
  });
});
