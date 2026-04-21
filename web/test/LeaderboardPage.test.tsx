import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../src/pages/LeaderboardPage.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("LeaderboardPage", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("renders tab buttons", () => {
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    expect(screen.getByRole("tab", { name: /per-game/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /global/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /online now/i })).toBeInTheDocument();
  });

  it("fetches and renders per-game rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify([{ rank: 1, username: "alice", score: 500, playedAt: Date.now() }]),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    expect(await screen.findByText(/alice/)).toBeInTheDocument();
    expect(await screen.findByText(/500/)).toBeInTheDocument();
  });

  it("switches to Global tab", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response(
        JSON.stringify([{ rank: 1, username: "bob", gamesPlayed: 3 }]),
        { status: 200, headers: { "content-type": "application/json" } },
      ))
    );
    const user = userEvent.setup();
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    await user.click(screen.getByRole("tab", { name: /global/i }));
    expect(await screen.findByText(/3 games/)).toBeInTheDocument();
  });
});
