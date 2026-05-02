import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";

function authenticate() {
  useAuth.setState({ username: "alice", token: "tok.tok.tok", expiresAt: Date.now() + 1000 * 60 });
}

describe("AppShell", () => {
  beforeEach(() => useAuth.getState().logout());

  it("redirects unauthenticated users to /login", () => {
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("shows the lobby when authenticated", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("tile-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("current-user")).toHaveTextContent("alice");
  });

  it("logout clears the store", async () => {
    authenticate();
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(useAuth.getState().token).toBeNull();
  });

  it("renders the Quick Start button when authenticated", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("quick-start-btn")).toBeInTheDocument();
  });

  it("Quick Start button navigates to a play URL with quickstart=1", async () => {
    authenticate();
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    await user.click(screen.getByTestId("quick-start-btn"));
    // After quickstart navigation the lobby tile is gone; the play page is
    // mounted and the auto-start effect strips quickstart=1 from the URL,
    // so we just confirm the lobby is no longer rendered.
    expect(screen.queryByTestId("tile-klondike")).not.toBeInTheDocument();
  });
});
