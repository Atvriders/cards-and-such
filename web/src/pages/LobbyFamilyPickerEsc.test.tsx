import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W913 — pressing Escape dismisses the FamilyPicker dialog.
 *
 * Sibling coverage:
 *   • W761 (LobbyPage.test.tsx) — `?family=<id>` deep-link auto-opens.
 *   • W892 (LobbyFamilyClick.test.tsx) — clicking a family tile opens.
 *   • W902 (LobbyFamilyPickerClose.test.tsx) — × button dismisses.
 *
 * What was untested: the Escape-key dismissal path. The picker exposes
 * three close paths (LobbyPage.tsx):
 *   1. Backdrop click — `onClick={onClose}` on the backdrop div (L3590).
 *   2. Escape key — window keydown listener (L1337-L1345). [this test]
 *   3. Header close button — covered by W902.
 *
 * Escape is the canonical a11y dismissal affordance for modals
 * (`role="dialog" aria-modal="true"`, L3585-L3586) and the most likely
 * path to silently regress if the keydown listener's effect deps drift.
 *
 * The handler binds on `window` (L1343) and only runs while
 * `openFamilyId` is truthy — so we must reach the open state first.
 * We deep-link via `/?family=klondike` to mirror W761/W902 and avoid
 * re-litigating W892's tile-click flow. `klondike` is the canonical
 * family id stable across registry churn (see web/src/games/families.ts).
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx
 * so it shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits — mirrors W874/W892/W902.
 */
describe("LobbyPage — FamilyPicker Escape dismisses dialog (W913)", () => {
  const FAMILY_ID = "klondike";

  beforeEach(() => {
    localStorage.clear();
  });

  it("pressing Escape unmounts the fam-picker-<id> dialog", async () => {
    render(
      <MemoryRouter initialEntries={[`/?family=${FAMILY_ID}`]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pre-condition: the picker is mounted via the W761 auto-open path.
    // We wait for it explicitly because the deep-link effect runs after
    // the first render commit, and the keydown listener also only
    // attaches once `openFamilyId` is non-null (LobbyPage.tsx L1339).
    const picker = await waitFor(() =>
      screen.getByTestId(`fam-picker-${FAMILY_ID}`),
    );
    expect(picker).toBeInTheDocument();

    // Action: dispatch Escape on `window`, which is where the picker's
    // keydown handler is registered (LobbyPage.tsx L1343). Firing on
    // `document` would also bubble to window listeners, but window is
    // the literal target — keeps the test honest about the wiring.
    fireEvent.keyDown(window, { key: "Escape" });

    // Outcome: the picker is gone. `queryBy*` (not `getBy*`) so the
    // failure mode is a clean assertion message rather than a throw,
    // and we wait so any future close-animation does not race the check.
    await waitFor(() => {
      expect(
        screen.queryByTestId(`fam-picker-${FAMILY_ID}`),
      ).not.toBeInTheDocument();
    });
  });
});
