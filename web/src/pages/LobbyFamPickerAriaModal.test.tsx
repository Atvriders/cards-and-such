import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1280 — the FamilyPicker dialog opened from a FamilyCard click MUST
 * carry `aria-modal="true"` on the same root element that exposes
 * `role="dialog"`.
 *
 * The contract (LobbyPage.tsx L3583-L3590) pairs `role="dialog"` with
 * `aria-modal="true"` so assistive tech treats the picker as a modal —
 * a regression that drops `aria-modal` (or flips it to `"false"`) is
 * silently catastrophic for screen-reader users because the dialog
 * still *renders*, the close button still *closes*, and the existing
 * tests in LobbyFamilyClick / LobbyFamilyPickerClose / LobbyFamilyPickerEsc
 * keep passing — none of them inspect the `aria-modal` attribute. The
 * sibling W761 deep-link test (LobbyPage.test.tsx) and W873 family-tile
 * rating test also leave this attribute uncovered, despite W1093
 * referencing it inline only as a doc comment in
 * LobbyFamilyPickerEsc.test.tsx (L21).
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx so
 * it shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the main test module — mirrors W892/W874.
 */
describe("LobbyPage — fam-picker dialog has aria-modal=\"true\" (W1280)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("opens fam-picker via family-card click and exposes aria-modal=\"true\"", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Narrow the grid to klondike — same deterministic strategy as W892
    // (LobbyFamilyClick.test.tsx). With a search query active the
    // featured strip is suppressed and the family surfaces only via its
    // grid tile.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "klondike" } });

    const tile = await waitFor(() =>
      screen.getByTestId(`grid-tile-${FAMILY_ID}`),
    );

    // Click the family-card to open the fam-picker dialog (L2361 wires
    // onClick → setOpenFamilyId, which mounts the picker at L3582+).
    fireEvent.click(tile);

    const dialog = await waitFor(() =>
      screen.getByTestId(`fam-picker-${FAMILY_ID}`),
    );

    // Pin the modality contract. role="dialog" + aria-modal="true" must
    // sit on the SAME element so assistive tech treats it as a modal.
    // The literal string "true" matters — a boolean-coerced "false" or
    // a missing attribute both fail screen-reader expectations.
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
