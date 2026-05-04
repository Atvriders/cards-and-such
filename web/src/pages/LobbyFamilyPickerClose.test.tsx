import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W902 — clicking the FamilyPicker's close button (×) dismisses the
 * picker dialog.
 *
 * Sibling coverage:
 *   • W761 (LobbyPage.test.tsx) — `?family=<id>` deep-link auto-opens.
 *   • W892 (LobbyFamilyClick.test.tsx) — clicking a family tile opens.
 *
 * What was untested: dismissal. The picker exposes three close paths
 * (LobbyPage.tsx):
 *   1. Backdrop click — `onClick={onClose}` on the backdrop div (L3590).
 *   2. Escape key — window keydown listener (L1337-L1345).
 *   3. Header close button — `<button className="lobby-picker-close"
 *      aria-label="Close variant picker">×</button>` (L3608-L3613).
 *
 * This test pins #3, the explicit close-button path, because it is the
 * most discoverable affordance for mouse users and the most likely to
 * regress under header refactors (the search/sort header sits in the
 * same flex row). We use the picker's deep-link auto-open path
 * (`/?family=klondike`) to reach the open state without re-litigating
 * W892's tile-click flow.
 *
 * `klondike` is the canonical family id reused by W761/W892 — stable
 * across registry churn (see `web/src/games/families.ts`).
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx
 * so it shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the main test module — mirrors
 * W874/W892.
 */
describe("LobbyPage — FamilyPicker close button dismisses dialog (W902)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking the × button unmounts the fam-picker-<id> dialog", async () => {
    render(
      <MemoryRouter initialEntries={[`/?family=${FAMILY_ID}`]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pre-condition: the picker is mounted via the W761 auto-open path.
    // We wait for it explicitly because the deep-link effect runs after
    // the first render commit.
    const picker = await waitFor(() =>
      screen.getByTestId(`fam-picker-${FAMILY_ID}`),
    );
    expect(picker).toBeInTheDocument();

    // Locate the explicit close affordance via its aria-label — the same
    // contract surfaced to assistive tech. Querying by aria-label rather
    // than class keeps the test resilient to CSS-module refactors while
    // still asserting the user-visible name stays accessible.
    const closeBtn = screen.getByRole("button", {
      name: "Close variant picker",
    });

    // Action: click the × button. The button's onClick is the picker's
    // `onClose` prop (LobbyPage.tsx L3611), which in the parent flips
    // `openFamilyId` back to null and unmounts the dialog.
    fireEvent.click(closeBtn);

    // Outcome: the picker is gone. We use `queryBy*` (not `getBy*`) so
    // the assertion fails with a clear "found in document" message
    // instead of throwing on lookup, and we wait so a future
    // close-animation transition does not race the assertion.
    await waitFor(() => {
      expect(
        screen.queryByTestId(`fam-picker-${FAMILY_ID}`),
      ).not.toBeInTheDocument();
    });
  });
});
