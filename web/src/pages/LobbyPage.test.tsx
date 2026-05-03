import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * `klondike` is a stable, well-known family id (see
 * `web/src/games/families.ts`) — used here so the deep-link assertion
 * stays meaningful even as the registry churns.
 */
const FAMILY_ID = "klondike";

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LobbyPage />
    </MemoryRouter>,
  );
}

describe("LobbyPage — ?family= deep link", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("auto-opens the FamilyPicker for a known family id", async () => {
    renderAt(`/?family=${FAMILY_ID}`);
    // The picker dialog itself appears.
    await waitFor(() => {
      expect(
        screen.getByTestId(`fam-picker-${FAMILY_ID}`),
      ).toBeInTheDocument();
    });
    // And the auto-open marker is stamped so tests can distinguish
    // deep-linked opens from regular click-to-open.
    expect(
      screen.getByTestId(`lobby-auto-family-${FAMILY_ID}`),
    ).toBeInTheDocument();
  });

  it("does not auto-open when the param is absent", () => {
    renderAt("/");
    expect(
      screen.queryByTestId(`fam-picker-${FAMILY_ID}`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`lobby-auto-family-${FAMILY_ID}`),
    ).not.toBeInTheDocument();
  });

  it("ignores unknown family ids and does not open a picker", () => {
    renderAt("/?family=does-not-exist");
    expect(
      screen.queryByTestId("lobby-auto-family-does-not-exist"),
    ).not.toBeInTheDocument();
  });
});

/**
 * Sort dropdown — covers the default value, that all four documented
 * modes are reachable as <option> elements with the agreed test ids,
 * and that the user's choice round-trips through `cards-lobby-sort` so
 * a reload rehydrates the same selection.
 */
describe("LobbyPage — sort dropdown", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all four sort modes with the expected test ids", () => {
    renderAt("/");
    for (const mode of ["alphabetical", "most-played", "newest", "top-rated"] as const) {
      expect(screen.getByTestId(`lobby-sort-${mode}`)).toBeInTheDocument();
    }
  });

  it("defaults to alphabetical when no preference is stored", () => {
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    expect(select.value).toBe("alphabetical");
  });

  it("persists the selected mode to localStorage under cards-lobby-sort", () => {
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "most-played" } });
    expect(select.value).toBe("most-played");
    expect(localStorage.getItem("cards-lobby-sort")).toBe("most-played");
  });

  it("rehydrates the persisted mode on next render", () => {
    localStorage.setItem("cards-lobby-sort", "newest");
    renderAt("/");
    const select = screen.getByTestId("lobby-sort") as HTMLSelectElement;
    expect(select.value).toBe("newest");
  });
});

/**
 * New-user keyboard-shortcut tip — only renders for users with zero
 * games played, on the empty default view, when not previously
 * dismissed. The dismissal flag round-trips through localStorage so
 * the same browser is never re-prompted.
 */
describe("LobbyPage — keyboard shortcut tip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the inline tip for a brand-new user on the default view", () => {
    renderAt("/");
    expect(screen.getByTestId("lobby-kbd-tip")).toBeInTheDocument();
    expect(screen.getByTestId("lobby-kbd-tip-dismiss")).toBeInTheDocument();
  });

  it("hides the tip once the user has played at least one game", () => {
    localStorage.setItem(
      "cards-and-such:stats:v1",
      JSON.stringify({ totalPlayed: 1, perGame: {}, perCategory: {} }),
    );
    renderAt("/");
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
  });

  it("hides and persists dismissal when the close button is clicked", () => {
    renderAt("/");
    const dismiss = screen.getByTestId("lobby-kbd-tip-dismiss");
    fireEvent.click(dismiss);
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
    expect(localStorage.getItem("cards-lobby-kbd-tip-dismissed")).toBe("1");
  });

  it("stays hidden across renders once the dismissal flag is set", () => {
    localStorage.setItem("cards-lobby-kbd-tip-dismissed", "1");
    renderAt("/");
    expect(screen.queryByTestId("lobby-kbd-tip")).not.toBeInTheDocument();
  });
});
