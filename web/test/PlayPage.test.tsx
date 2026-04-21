import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("PlayPage", () => {
  it("renders not-found for unknown game id", () => {
    useAuth.setState({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 1000 * 60 });
    render(
      <MemoryRouter initialEntries={["/play/does-not-exist"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("game-not-found")).toBeInTheDocument();
  });
});
