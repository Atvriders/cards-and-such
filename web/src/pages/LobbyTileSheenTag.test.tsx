import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1839 — pin the EXACT `tagName` ("SPAN") on every solo-card tile's
 * decorative sweep-highlight `tile-sheen` element.
 *
 * Each `GameCard` / `FamilyCard` (LobbyPage.tsx ~L2058 / ~L2989 /
 * ~L3229 / ~L3382 / ~L3441) renders a
 * `<span className="tile-sheen" aria-hidden="true" />` immediately
 * inside the tile root. The CSS in LobbyPage.css positions the sheen
 * via `.tile-sheen { position: absolute; ... }` paired with the
 * sibling `tile-stripe` span — both are inline, presentation-only
 * decorations that MUST remain `<span>` to avoid introducing block
 * layout flow inside the `<Link>` (a `<div>` would break the inline
 * formatting context and shift the icon/title baseline).
 *
 * Sibling tests pin tile-sheen className equality (W1717) and
 * aria-hidden (W1389), but neither asserts the element TAG. A
 * regression that swapped the span for `<div className="tile-sheen">`
 * would slip past className-equality (still "tile-sheen") and
 * aria-hidden checks (still "true"), yet would corrupt the inline
 * layout. Grepping `Lobby*.test.tsx` for `sheen.tagName` /
 * `tile-sheen.*tagName` returns zero matches.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the W1717 / W1389 siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-sheen span tagName (W1839)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders every tile-sheen element with tagName === \"SPAN\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount — the search input is the canonical
    // "lobby is ready" anchor used by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Use attribute-substring selector so a regression that injects
    // extra class tokens (e.g. "tile-sheen lobby-anim") still surfaces
    // for the tagName check below, rather than being silently filtered.
    const sheens = document.querySelectorAll<HTMLElement>(
      '[class*="tile-sheen"]',
    );
    expect(sheens.length).toBeGreaterThan(0);

    let checked = 0;
    for (const sheen of Array.from(sheens)) {
      const cls = sheen.className;
      // Only inspect the actual sheen element — guard against any
      // future siblings that might share the `tile-sheen` substring
      // (e.g. `tile-sheen-glow`).
      if (!/(^|\s)tile-sheen(\s|$)/.test(cls)) continue;

      // Pin the EXACT element tag — must remain a <span> to preserve
      // the inline formatting context inside the tile <Link>.
      expect(sheen.tagName).toBe("SPAN");
      checked += 1;
    }

    // Sanity: at least one real sheen was inspected so the suite
    // can't pass by skipping every element above.
    expect(checked).toBeGreaterThan(0);
  });
});
