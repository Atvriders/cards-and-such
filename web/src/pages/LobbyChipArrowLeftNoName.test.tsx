import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2817 — the chip strip's LEFT overflow scroll-arrow button is rendered
 * without a `name` attribute. The button is a decorative scroll
 * affordance (it just nudges the chip strip via JS), not a form control,
 * so it must not carry a form-submission `name` that would leak into
 * any ancestor <form> as `name=value` form data on submit.
 *
 * Why this needs its own pin:
 *  - LobbyChipArrowLeftType.test.tsx (W2313) pins `type="button"`,
 *    LobbyChipArrowLeftTagName.test.tsx (W2435) pins the BUTTON tagName,
 *    LobbyChipArrowLeftTabIndex.test.tsx (W1328) pins `tabIndex={-1}`,
 *    LobbyChipArrowLeftAria.test.tsx (W1319) pins the aria-label,
 *    LobbyChipArrowLeftNoId.test.tsx (W2452) pins absence of `id`,
 *    LobbyChipArrowLeftNoStyle.test.tsx pins absence of inline `style`,
 *    and LobbyChipArrowLeftNoDraggable.test.tsx pins absence of
 *    `draggable`. None of those would notice if a stray `name="…"`
 *    regressed onto this button (e.g. via a refactor that copy-pasted
 *    a real form-control button template).
 *  - Even with `type="button"` pinned, a `name` attribute is invalid
 *    semantics on a non-submit button and can confuse autofill / form
 *    serialization tooling that walks descendant form controls.
 *  - Mirror coverage: LobbyChipArrowRight has its own family of pins;
 *    this one is left-arrow specific so a one-sided regression is
 *    caught here.
 *
 * The button is rendered with `hidden` toggled by overflow geometry, so
 * we resolve it by stable BEM modifier class rather than via
 * `getByRole("button", { name })`, which would skip elements whose
 * `hidden` attribute is set on first paint.
 */
describe("LobbyPage — chip-strip LEFT arrow has no name attribute (W2817)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the left scroll-arrow without a name attribute", () => {
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
    // for an empty `name=""`, which getAttribute would surface as "" and
    // the .name IDL property would surface as "" (indistinguishable from
    // "no name" via the property mirror alone). Pinning hasAttribute
    // catches both "name was added" and "name was added but left empty".
    expect(left!.hasAttribute("name")).toBe(false);
    // Belt-and-braces: the IDL mirror should also be the empty string,
    // which is what jsdom reports when the attribute is absent.
    expect(left!.name).toBe("");
  });
});
