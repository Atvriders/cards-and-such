import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1299 — the `.lobby-chip-count` badge MUST be a `<span>` element per the
 * Chip component (LobbyPage.tsx ~L2664):
 *
 *     <span className="lobby-chip-count">{count.toLocaleString()}</span>
 *
 * Existing chip-badge coverage pins ONLY the textContent of the badge:
 *   - W1208 (LobbyAllChipBadge.test.tsx)            — chip-all total text
 *   - W1229 (LobbySolitaireChipBadge.test.tsx)      — chip-solitaire text
 *   - W1139 / W1158 / W1175 / W1194                  — zero-state text
 *   - LobbyPage.test.tsx ~L2295                      — digit-shape audit
 *
 * NONE of those assert the badge's tagName, so a regression that swapped
 * the badge to a `<div>`, `<em>`, `<small>`, etc. (which would change
 * inline-flow semantics inside the chip button — `<button>` permits
 * phrasing content only, so a block element here would be invalid HTML
 * and could break flexbox alignment of the count pill) would still pass
 * every textContent test.
 *
 * Pinning `tagName === "SPAN"` is therefore additive: it locks the
 * element type without re-asserting any value already covered by sibling
 * tests. Uses `chip-all` because it is the static, always-present chip
 * (count source is `GAMES.length`, see LobbyPage.tsx ~L1935) and so the
 * test does not depend on user data / filter state.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W1208 / W1229: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — chip count badge is a <span> element (W1299)", () => {
  it("renders the chip-all .lobby-chip-count badge as a SPAN", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-all");
    const badge = chip.querySelector<HTMLElement>(".lobby-chip-count");
    expect(badge).not.toBeNull();
    // Pin the element type. The Chip component (LobbyPage.tsx ~L2664)
    // wraps `count.toLocaleString()` in a `<span>`; a regression to any
    // other tag (div/em/small/...) would silently pass every existing
    // textContent / digit-shape audit.
    expect(badge!.tagName).toBe("SPAN");
  });
});
