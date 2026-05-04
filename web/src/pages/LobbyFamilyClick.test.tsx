import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W892 — clicking a FamilyCard tile in the main grid opens the
 * FamilyPicker modal.
 *
 * Sibling W874 (LobbyTileClick.test.tsx) covers the standalone-tile
 * affordance: a SoloCard click navigates the router to `/play/<id>`.
 * Family tiles are different — their primary affordance is to open a
 * picker dialog so the user can choose a variant. W761
 * (LobbyPage.test.tsx) confirms the `?family=` deep-link auto-opens that
 * picker; this test pins the *click-to-open* path that the deep-link
 * test does not exercise.
 *
 * Implementation under test (LobbyPage.tsx L2356-L2380): the FamilyCard
 * receives `onClick={() => setOpenFamilyId(entry.family.id)}` which flips
 * the `openFamilyId` state, and the modal at L2438+ renders the
 * `fam-picker-<id>` dialog when that state is set.
 *
 * `klondike` is the canonical family id reused by W761/W609 — its grid
 * tile testid is demoted to `grid-tile-klondike` because klondike is in
 * the featured strip (LobbyPage.tsx L2362-L2369 + L1694-L1701). We
 * narrow the visible grid via search so the assertion is not affected
 * by pagination boundaries (PAGE_SIZE=80) regardless of registry churn.
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx
 * so it shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the main test module — mirrors
 * W874/W766/W789/W803.
 */
describe("LobbyPage — FamilyCard click opens FamilyPicker (W892)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking a family tile opens the fam-picker-<id> dialog", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to a single deterministic tile. With a search
    // query active, the featured strip is suppressed (L2000) so the
    // klondike family surfaces only via its grid tile — whose testid is
    // demoted to `grid-tile-klondike` because klondike still lives in
    // FEATURED_IDS (L1690-L1701).
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // Pre-condition: the picker is closed before any click. A regression
    // that auto-opens on render (e.g. the W761 deep-link path firing on
    // a bare `/` route) would surface here before the user input.
    expect(
      screen.queryByTestId(`fam-picker-${FAMILY_ID}`),
    ).not.toBeInTheDocument();

    // The FamilyCard's root is a `<button onClick={onClick}>` (L3215);
    // the parent grid wires `onClick={() => setOpenFamilyId(...)}`
    // (L2361). A plain click should flip `openFamilyId` and mount the
    // FamilyPicker dialog.
    fireEvent.click(tile);

    // Outcome: the picker dialog appears with the matching testid.
    // We do NOT assert on the `lobby-auto-family-<id>` marker here —
    // that marker is W761's deep-link sentinel and must stay absent for
    // a click-driven open (its presence would indicate the test is
    // accidentally exercising the deep-link path instead).
    await waitFor(() => {
      expect(
        screen.getByTestId(`fam-picker-${FAMILY_ID}`),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(`lobby-auto-family-${FAMILY_ID}`),
    ).not.toBeInTheDocument();
  });
});
