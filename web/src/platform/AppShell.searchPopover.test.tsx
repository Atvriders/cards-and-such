import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App.js";
import { useAuth } from "./stores/auth.js";

function authenticate(): void {
  useAuth.setState({
    username: "alice",
    token: "tok.tok.tok",
    expiresAt: Date.now() + 1000 * 60,
  });
}

async function openHeaderSearch(
  user: ReturnType<typeof userEvent.setup>,
): Promise<HTMLInputElement> {
  // The header has two elements with aria-label "Search lobby": the toggle
  // button and the input. Click the toggle first (collapsed → open), then
  // grab the input via its unique placeholder.
  const toggle = screen.getByRole("button", { name: /search lobby/i });
  await user.click(toggle);
  const input = screen.getByPlaceholderText(
    /search games\.\.\./i,
  ) as HTMLInputElement;
  // Focus is what flips popoverOpen on; clicking via userEvent also focuses.
  await user.click(input);
  return input;
}

describe("AppShell header search popover (W179/W230)", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    localStorage.clear();
  });

  it("shows recents + suggestions on focus when input is empty", async () => {
    authenticate();
    localStorage.setItem(
      "cards-recent-searches",
      JSON.stringify(["solitaire", "chess"]),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await openHeaderSearch(user);

    const popover = await screen.findByTestId("header-search-popover-empty");
    // Recent searches header + both stored entries are rendered. Use exact
    // match to avoid colliding with the "Clear recent searches" footer button.
    expect(within(popover).getByText("Recent searches")).toBeInTheDocument();
    expect(screen.getByTestId("header-search-recent-0")).toHaveTextContent(
      "solitaire",
    );
    expect(screen.getByTestId("header-search-recent-1")).toHaveTextContent(
      "chess",
    );
    // Suggested-queries section also renders below recents.
    expect(within(popover).getByText(/try one of these/i)).toBeInTheDocument();
    expect(screen.getByTestId("header-search-suggest-0")).toBeInTheDocument();
    expect(screen.getByTestId("header-search-suggest-4")).toBeInTheDocument();
  });

  it("ArrowDown / ArrowUp cycle the highlighted row in the empty state", async () => {
    authenticate();
    localStorage.setItem(
      "cards-recent-searches",
      JSON.stringify(["solitaire"]),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const input = await openHeaderSearch(user);
    await screen.findByTestId("header-search-popover-empty");

    // Initial: nothing highlighted.
    expect(screen.getByTestId("header-search-recent-0")).toHaveAttribute(
      "aria-selected",
      "false",
    );

    // ArrowDown → row 0 (the one recent) highlighted.
    input.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByTestId("header-search-recent-0")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // ArrowDown again → row 1 (first suggestion) highlighted, recent off.
    await user.keyboard("{ArrowDown}");
    expect(screen.getByTestId("header-search-recent-0")).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByTestId("header-search-suggest-0")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // ArrowUp → back to row 0 (recent) highlighted.
    await user.keyboard("{ArrowUp}");
    expect(screen.getByTestId("header-search-recent-0")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("header-search-suggest-0")).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("Enter on a highlighted empty-state row navigates to /search?q=<query>", async () => {
    authenticate();
    localStorage.setItem(
      "cards-recent-searches",
      JSON.stringify(["solitaire"]),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const input = await openHeaderSearch(user);
    await screen.findByTestId("header-search-popover-empty");

    // Highlight the lone "solitaire" recent (index 0) and press Enter.
    input.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    // runQuery() navigates to /search?q=solitaire, mounting SearchPage.
    const searchInput = await screen.findByTestId("search-input");
    expect(searchInput).toHaveValue("solitaire");
  });
});
