import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1344 — the SoloCard's footer "Play" CTA span (LobbyPage.tsx ~L3052)
 * is decorative-only: the entire tile is wrapped in a `<Link>` whose
 * `aria-label` already encodes the title, category, plays, and favorite
 * state (LobbyPage.tsx L2976). The visible "Play" + arrow chevron is a
 * sighted-only affordance — exposing it to AT would either duplicate
 * the accessible name ("Klondike … play, no plays yet, not favorited
 * Play") or worse, override it. The `aria-hidden="true"` annotation on
 * the `.tile-cta` span is what suppresses that leak.
 *
 * Existing coverage:
 *   - LobbyFamilyCta.test.tsx (W1314) pins the FAMILY tile's CTA TEXT
 *     ("Pick" not "Play") but does NOT assert `aria-hidden`.
 *   - LobbyTileClick.test.tsx (W874), LobbyPageHide.test.tsx (W248),
 *     LobbyPage.test.tsx (W579/W604) all cover NAVIGATION / interaction.
 *   - tile-rating, tile-fav, tile-eta, tile-menu, family-card branches
 *     are all covered by sibling files. No test asserts the SoloCard's
 *     `tile-cta` `aria-hidden` attribute itself.
 *
 * A regression that dropped `aria-hidden="true"` (or flipped it to
 * `false`) would surface a duplicated "Play" announcement on every
 * solo tile in the lobby — a noticeable AT-noise regression that no
 * other test catches.
 *
 * `texas-holdem` is the canonical standalone (non-family) id reused by
 * W248/W766/W789/W803/W874 — narrowing the grid via search to that
 * single tile keeps the within-tile `tile-cta` lookup unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as W874 / W1265 / W1291 / W1314: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — solo tile-cta aria-hidden (W1344)", () => {
  const STANDALONE_ID = "texas-holdem";

  beforeEach(() => {
    localStorage.clear();
  });

  it("solo-card .tile-cta carries aria-hidden=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to the canonical standalone tile (mirrors W874).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // The footer CTA span sits inside the SoloCard's outer `<Link>`.
    // It contains the literal "Play" text and an arrow SVG; the entire
    // span is hidden from AT because the wrapping Link already owns
    // the accessible name.
    const cta = tile.querySelector(".tile-cta");
    expect(cta).not.toBeNull();
    // String form — React serialises `aria-hidden={true}` and
    // `aria-hidden="true"` identically, but pinning the literal "true"
    // guards against an accidental flip to `aria-hidden={false}`
    // (which renders as the string "false" — still present but
    // inverted in meaning).
    expect(cta!.getAttribute("aria-hidden")).toBe("true");
    // Belt-and-braces: confirm we're anchored on the SoloCard CTA
    // (text "Play" — family CTA reads "Pick" per W1314), not some
    // other `.tile-cta` rendered higher in the tree.
    expect(cta).toHaveTextContent(/^Play/);
  });
});
