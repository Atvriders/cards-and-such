import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2842 — the chip-strip's RIGHT overflow scroll-arrow button
 * (`.lobby-chips-arrow--right`) is rendered WITHOUT an
 * `aria-keyshortcuts` attribute.
 *
 * `aria-keyshortcuts` is meant to advertise specific keyboard
 * shortcut chords (e.g. "Alt+Right", "Control+End") that a user
 * can press to operate a widget without first focusing it. The
 * right scroll-arrow on the lobby chip strip has NO such global
 * hotkey: it is a presentational scroll affordance that is itself
 * skipped from the tab order (`tabIndex={-1}`, see
 * LobbyChipArrowRightTabIndex.test.tsx / W1746) and is operated
 * exclusively via mouse / pointer click. Authoring
 * `aria-keyshortcuts="Alt+ArrowRight"` (or any other chord) on it
 * would either lie to assistive tech (announcing a key combo that
 * does nothing) or, if a future developer wired a chord and forgot
 * to keep the attribute in sync, drift silently.
 *
 * Why this needs its own pin separate from the existing
 * `.lobby-chips-arrow--right` family of pins:
 *  - W2371 (LobbyChipArrowRightTagName) pins `BUTTON` tagName.
 *  - W1408 (LobbyChipArrowRightType)    pins `type="button"`.
 *  - W1746 (LobbyChipArrowRightTabIndex) pins `tabIndex={-1}`.
 *  - W2444 (LobbyChipArrowRightNoId)    pins absence of `id`.
 *  - W2793 (LobbyChipArrowRightNoDraggable) pins no `draggable`.
 *  - LobbyChipArrowRightNoLang / NoName / NoStyle pin absence of
 *    those specific attributes.
 *  - W2816 (LobbyChipArrowRightNoStyle) pins no inline `style`.
 *  - LobbyPage.test.tsx (~L2260) reads `aria-label` and `hidden`.
 *  - W2809 (LobbyChipStripNoAriaKeyshortcuts) pins absence of
 *    `aria-keyshortcuts` on the INNER `.lobby-chips` tablist track,
 *    NOT on the right scroll-arrow button.
 *  - None of the above would catch a regression that added
 *    `aria-keyshortcuts="Alt+ArrowRight"` (or similar) to the
 *    right scroll-arrow `<button>`.
 *
 * The pin: `right.hasAttribute("aria-keyshortcuts") === false`.
 * `hasAttribute` (rather than `getAttribute(...) === null`) is the
 * canonical primitive for asserting *absence*, matching the
 * accessor screen readers / accessibility audits use to decide
 * whether to announce shortcut hints. It also catches an empty
 * `aria-keyshortcuts=""` regression, which `getAttribute` length
 * checks would silently miss.
 *
 * Anchor: `document.querySelector(".lobby-chips-arrow--right")`.
 * The button is rendered with `hidden` toggled by overflow
 * geometry on first paint, so resolving via `getByRole("button",
 * { name })` would skip it (RTL filters hidden elements by
 * default). Querying by stable BEM modifier class matches the
 * resolution strategy used in sibling LobbyChipArrowRight*.test.tsx
 * files.
 */
describe("LobbyPage — .lobby-chips-arrow--right has no aria-keyshortcuts attribute (W2842)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the right scroll-arrow WITHOUT an aria-keyshortcuts attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const right = document.querySelector<HTMLButtonElement>(
      ".lobby-chips-arrow--right",
    );
    expect(right).not.toBeNull();

    // Sanity: confirm the resolved node is the actual <button>, not
    // a descendant or wrapper that happens to share the modifier
    // class. Without this guard a future restructure could pass the
    // assertion vacuously by moving the class onto a non-button
    // wrapper that never had `aria-keyshortcuts` in the first place.
    expect(right!.tagName).toBe("BUTTON");
    expect(right!.classList.contains("lobby-chips-arrow--right")).toBe(true);

    // The pin: NO aria-keyshortcuts attribute is authored on the
    // right scroll-arrow. A regression that adds
    // `aria-keyshortcuts="Alt+ArrowRight"` (or similar) — promising
    // a global hotkey that does not exist, or that exists but is
    // undocumented and untested — would fail here.
    expect(right!.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});
