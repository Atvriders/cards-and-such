import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2757 — the lobby chip-strip tablist (`.lobby-chips`) must not declare
 * an explicit `aria-orientation` attribute.
 *
 * Why pin the *absence*:
 *  - `role="tablist"` defaults to `aria-orientation="horizontal"` per the
 *    WAI-ARIA spec, which is exactly what the chip strip is — a single
 *    horizontal row of category filters that scrolls left/right via the
 *    flanking arrow buttons. Adding an explicit `aria-orientation` would
 *    be redundant noise; setting it to `"vertical"` would mis-describe
 *    the widget to assistive tech and conflict with the visual layout
 *    (and the horizontal-scroll affordance buttons).
 *  - Sibling tests pin the *presence* of `role="tablist"` (W… — see
 *    LobbyChipStripAria.test.tsx) and the literal aria-label
 *    ("Filter by category"). This file complements those by locking the
 *    *absence* of an orientation override, so future refactors that try
 *    to "be explicit" by spelling out aria-orientation will trip a test.
 *  - Sibling-file placement (rather than appending to LobbyPage.test.tsx
 *    or LobbyChipStripAria.test.tsx) follows the established
 *    `LobbyChipStrip*` per-attribute convention so the test joins the
 *    `src/pages/Lobby` vitest path filter without touching files that
 *    other concurrent pins are editing.
 */
describe("LobbyPage — chip strip has no aria-orientation (W2757)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not set aria-orientation on the .lobby-chips tablist", () => {
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
    // DOM, not merely empty/null. This relies on the implicit horizontal
    // default that `role="tablist"` already provides per WAI-ARIA.
    expect(strip!.hasAttribute("aria-orientation")).toBe(false);
  });
});
