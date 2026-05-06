import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2827 — the chip strip's RIGHT overflow scroll-arrow button is rendered
 * without a `lang` attribute. The arrow is a decorative scroll affordance
 * that holds no human-language content of its own, so it must inherit the
 * document's effective language rather than declare an override.
 *
 * Why this needs its own pin:
 *  - Sibling pins cover other attribute-absences on this element:
 *    LobbyChipArrowRightNoId (W2444), LobbyChipArrowRightNoName,
 *    LobbyChipArrowRightNoStyle, LobbyChipArrowRightNoDraggable,
 *    LobbyChipArrowRightTabIndex, LobbyChipArrowRightType, and
 *    LobbyChipArrowRightTagName. None of them notice a stray
 *    `lang="en"` (or similar) regression on this button.
 *  - A `lang` attribute on a non-textual control is an a11y smell:
 *    screen readers would announce a language switch around an icon-only
 *    button, and any inherited locale from <html lang> would be
 *    silently overridden.
 *
 * The button is rendered with `hidden` toggled by overflow geometry on
 * first paint, so we resolve it by stable BEM modifier class rather
 * than via `getByRole("button", { name })`, which would skip a hidden
 * element.
 */
describe("LobbyPage — chip-strip RIGHT arrow has no lang (W2827)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow without a lang attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // hasAttribute catches both "lang was added" and "lang was added
    // but left empty" (an empty string is still a declared override
    // that suppresses inheritance from <html lang>).
    expect(right!.hasAttribute("lang")).toBe(false);
    // Belt-and-braces: the IDL mirror should also be the empty string,
    // which is what jsdom reports when the attribute is absent.
    expect(right!.lang).toBe("");
  });
});
