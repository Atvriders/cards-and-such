import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppShell from "./AppShell.js";
import { useAuth } from "./stores/auth.js";

// W543 — footer structure smoke. The footer is rendered as part of the
// AppShell layout route, so we mount AppShell itself with a tiny stub
// child. We don't navigate anywhere; every assertion is against the
// initial render at "/".
function renderShell(): void {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<div data-testid="home-stub" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppShell footer (W543)", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    localStorage.clear();
    useAuth.setState({
      username: "alice",
      token: "tok.tok.tok",
      expiresAt: Date.now() + 60_000,
    });
  });

  it("W162: renders three footer columns (footer-col-1/2/3)", () => {
    renderShell();
    // Three sibling columns under the footer, each with its own data-testid.
    // Hitting all three in one assertion catches regressions where one
    // column gets accidentally collapsed into another.
    const col1 = screen.getByTestId("footer-col-1");
    const col2 = screen.getByTestId("footer-col-2");
    const col3 = screen.getByTestId("footer-col-3");
    expect(col1).toBeInTheDocument();
    expect(col2).toBeInTheDocument();
    expect(col3).toBeInTheDocument();
    // Column 2 is the link nav — confirm it carries the right aria role +
    // label so screen-reader users can navigate the footer with landmarks.
    expect(col2.tagName).toBe("NAV");
    expect(col2).toHaveAttribute("aria-label", "Site links");
  });

  it("W162: brand label and version pill render in column 1", () => {
    renderShell();
    const col1 = screen.getByTestId("footer-col-1");
    // Brand text uses an HTML entity (&amp;) so we match the rendered form.
    expect(within(col1).getByText(/Cards & Such/i)).toBeInTheDocument();
    // Version pill is a leading-`v` semver-ish span. The static literal is
    // baked at render time; we just confirm a vN token exists in the column.
    const version = col1.querySelector(".app-footer-version");
    expect(version).not.toBeNull();
    expect(version?.textContent ?? "").toMatch(/^v\d/);
  });

  it("W468: footer column 2 includes a Replays NavLink", () => {
    renderShell();
    const replays = screen.getByTestId("footer-replays-link");
    // Anchor renders as <a> via NavLink and points at /replays.
    expect(replays).toBeInTheDocument();
    expect(replays.tagName).toBe("A");
    expect(replays).toHaveAttribute("href", "/replays");
    // And it lives inside the link nav column (footer-col-2), not col-1/3.
    const col2 = screen.getByTestId("footer-col-2");
    expect(col2.contains(replays)).toBe(true);
  });

  it("W459: About link is present in the footer link column", () => {
    renderShell();
    // The About route renders the hint-coverage line (data-testid
    // about-hint-coverage) — reaching it requires the footer to expose an
    // About NavLink. We assert the link exists and points at /about so
    // hint-coverage stays reachable from the footer "About link area".
    const col2 = screen.getByTestId("footer-col-2");
    const about = within(col2).getByRole("link", { name: /^about$/i });
    expect(about).toHaveAttribute("href", "/about");
  });
});
