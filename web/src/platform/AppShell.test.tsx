import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppShell from "./AppShell.js";
import { useAuth } from "./stores/auth.js";

// Focused render smoke for AppShell. We mount it as a layout route with a
// stub child so the <Outlet /> has something to render, then assert that
// the major landmarks (header banner, main, footer contentinfo) and the
// outlet child are all present in the DOM.
function renderShell(): void {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={<div data-testid="outlet-stub">child slot</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppShell render", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "tok.tok.tok",
      expiresAt: Date.now() + 60_000,
    });
  });

  it("renders header banner, footer contentinfo, and main landmarks", () => {
    renderShell();
    // Header carries role="banner" and the brand label "Cards and Such".
    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(banner.textContent ?? "").toMatch(/Cards and Such/i);
    // Footer carries role="contentinfo" via the explicit role attribute.
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    // Main wrapper has id="main-content" so the skip link target works.
    const main = document.getElementById("main-content");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
  });

  it("renders the <Outlet /> child slot and the Main nav landmark", () => {
    renderShell();
    // The stub element confirms <Outlet /> actually mounted its child.
    expect(screen.getByTestId("outlet-stub")).toBeInTheDocument();
    expect(screen.getByTestId("outlet-stub").textContent).toBe("child slot");
    // The top-of-page nav uses aria-label="Main".
    const mainNav = screen.getByRole("navigation", { name: /^Main$/i });
    expect(mainNav).toBeInTheDocument();
  });

  it("renders the skip-to-content link and the current username pill", () => {
    renderShell();
    // Skip link is the first focusable element and points at #main-content.
    const skip = screen.getByTestId("skip-to-content");
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveAttribute("href", "#main-content");
    // The header surfaces the current username via data-testid="current-user".
    expect(screen.getByTestId("current-user").textContent).toBe("alice");
  });
});
