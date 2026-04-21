import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("PlayOnlinePage", () => {
  it("shows not-supported message for single-player-only games", () => {
    useAuth.setState({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 1000 * 60 });
    render(
      <MemoryRouter initialEntries={["/play/klondike/online"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/does not support online play/i)).toBeInTheDocument();
  });
});
