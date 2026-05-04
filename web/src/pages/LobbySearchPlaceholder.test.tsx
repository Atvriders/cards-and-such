import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W901 — the lobby search input renders the localised placeholder
 * resolved through the i18n `t("lobby.search.placeholder")` key.
 *
 * Existing coverage exercises search behavior (typing narrows tiles,
 * the clear-x button resets the query — see LobbyTileClick.test.tsx
 * W874 and friends) but no test pins the *placeholder string* itself,
 * which is the only affordance hinting at the input's purpose before
 * a user types anything. A regression that drops the i18n binding or
 * removes the `placeholder` attribute would slip past every existing
 * Lobby test because they all type into the input first.
 *
 * The placeholder text is sourced from `web/src/platform/i18n.ts`
 * (key `lobby.search.placeholder` → "Search 4,500+ games…"). The test
 * pins both the attribute being present and the resolved string so a
 * future copy edit forces an intentional update of either side.
 *
 * Lives in a sibling file rather than appending to LobbyPage.test.tsx
 * so it shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits — mirrors W766/W789/W803/W874.
 */
describe("LobbyPage — search input placeholder text (W901)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the i18n-resolved placeholder on the search input", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The search input is identified by its stable test id; relying on
    // the placeholder for lookup would be circular for this assertion.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;

    // The placeholder attribute must be present (a regression that
    // drops the prop would render `null`/empty) and must equal the
    // value resolved by `t("lobby.search.placeholder")` from the
    // active i18n table.
    expect(search.placeholder).toBe("Search 4,500+ games…");
  });
});
