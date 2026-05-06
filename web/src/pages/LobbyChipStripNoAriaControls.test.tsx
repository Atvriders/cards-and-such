import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2771 — the lobby chip-strip tablist (`.lobby-chips`) must not declare
 * an explicit `aria-controls` attribute.
 *
 * Why pin the *absence*:
 *  - `aria-controls` on a `role="tablist"` container is non-standard; the
 *    spec attaches `aria-controls` to each *individual* `role="tab"` so
 *    that a tab can point at the panel it reveals. The chip strip itself
 *    does not own a single owned panel — each chip filters the lobby grid
 *    inline rather than swapping a tabpanel — so a strip-level
 *    `aria-controls` would either be a fabricated id (broken reference)
 *    or a noisy duplicate of per-chip wiring.
 *  - Sibling tests already pin the *per-chip* absence of `aria-controls`
 *    (e.g. LobbyChipAllNoAriaControls / LobbyChipArcadeNoAriaControls /
 *    LobbyChipBoardNoAriaControls). This file complements those by
 *    locking the *strip-container* absence so a future refactor that
 *    tries to "wire the tablist to the grid" via aria-controls trips a
 *    test instead of silently shipping a broken reference.
 *  - Sibling-file placement (rather than appending to LobbyPage.test.tsx
 *    or LobbyChipStripAria.test.tsx) follows the established
 *    `LobbyChipStrip*` per-attribute convention so the test joins the
 *    `src/pages/Lobby` vitest path filter without touching files that
 *    other concurrent pins are editing.
 */
describe("LobbyPage — chip strip has no aria-controls (W2771)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not set aria-controls on the .lobby-chips tablist", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Locate via the stable className so the lookup itself is independent
    // of the attribute under test (and unambiguous vs. the sibling drawer
    // tablist that shares role="tablist").
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // hasAttribute (rather than getAttribute === null) makes the intent
    // explicit: the attribute must be entirely absent from the rendered
    // DOM, not merely empty/null. Per-chip aria-controls absence is
    // pinned separately; this guards the *container* level.
    expect(strip!.hasAttribute("aria-controls")).toBe(false);
  });
});
