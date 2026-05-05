import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2274 — pin the absence of the `tabindex` attribute on the lobby
 * tile's `.tile-sheen` decorative span.
 *
 * Each tile renders `<span className="tile-sheen" aria-hidden="true" />`
 * (LobbyPage.tsx ~L2989) — a purely decorative shimmer overlay styled
 * by `.tile:hover .tile-sheen` in LobbyPage.css. The span is already
 * marked `aria-hidden`, so it must also stay out of the keyboard
 * focus order: a stray `tabindex` (positive OR `0` OR even `-1` as
 * an unintended programmatic-focus target) would let assistive tech
 * or keyboard users land on a hidden decorative element, breaking
 * the documented "decorative chrome" contract.
 *
 * Sibling tests pin tile-sheen aria (W1389), tag (W1390), class
 * (W1391), no-id (W2061), no-style, and no-role — but none assert
 * the `tabindex` attribute is absent. Grepping
 * `web/src/pages/Lobby*.test.tsx` for `tile-sheen` paired with a
 * `tabindex` / `tabIndex` assertion returns no matches, leaving
 * this invariant unprotected.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other tile-sheen tests: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo-card tile-sheen has no tabindex (W2274)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-sheen span without a `tabindex` attribute", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount.
    await screen.findByPlaceholderText(/search/i);

    const sheen = document.querySelector<HTMLElement>(".tile-sheen");
    expect(sheen, "expected at least one .tile-sheen span").not.toBeNull();
    expect(sheen!.hasAttribute("tabindex")).toBe(false);
  });
});
