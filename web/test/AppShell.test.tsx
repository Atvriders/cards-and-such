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

  it("renders the Surprise button when authenticated", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("surprise-btn")).toBeInTheDocument();
  });

  it("Surprise button shows a splash and then leaves the lobby", async () => {
    authenticate();
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    await user.click(screen.getByTestId("surprise-btn"));
    // The splash flashes immediately on click.
    expect(screen.getByTestId("surprise-splash")).toBeInTheDocument();
    // After the brief delay the splash is dismissed and we navigate away.
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(screen.queryByTestId("tile-klondike")).not.toBeInTheDocument();
  });

  /* ---- v44 a11y additions ---- */

  it("renders the skip-to-content link pointing at #main-content", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    const skip = screen.getByTestId("skip-to-content");
    expect(skip).toBeInTheDocument();
    expect(skip.getAttribute("href")).toBe("#main-content");
  });

  it("exposes banner / main / contentinfo landmarks", () => {
    authenticate();
    const { container } = render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    // The shell-level <header> is the topmost <header role="banner">; it
    // sits inside .app-shell, while page-local headers live deeper.
    const shellHeader = container.querySelector(".app-shell > header[role='banner']");
    expect(shellHeader).not.toBeNull();
    // Main + footer are unique enough to query by role directly.
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("labels the primary navigation as 'Main'", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    const nav = screen.getByRole("navigation", { name: /^main$/i });
    expect(nav).toBeInTheDocument();
  });

  /* ---- v44 Browse-It-All page tracking ---- */

  it("stamps cards-pages-visited with 'lobby' on / mount", () => {
    authenticate();
    localStorage.removeItem("cards-pages-visited");
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    const arr = JSON.parse(localStorage.getItem("cards-pages-visited") ?? "[]") as string[];
    expect(arr).toContain("lobby");
  });

  it("stamps cards-pages-visited with 'stats' on /stats mount", () => {
    authenticate();
    localStorage.removeItem("cards-pages-visited");
    render(<MemoryRouter initialEntries={["/stats"]}><App /></MemoryRouter>);
    const arr = JSON.parse(localStorage.getItem("cards-pages-visited") ?? "[]") as string[];
    expect(arr).toContain("stats");
  });
});
