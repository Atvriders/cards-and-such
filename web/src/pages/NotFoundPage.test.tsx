import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import NotFoundPage from "./NotFoundPage.js";

function LocationProbe(): JSX.Element {
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname + loc.search}</div>;
}

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<LocationProbe />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NotFoundPage smoke", () => {
  it("renders without crashing on an unknown path", () => {
    renderAt("/totally-nonsense-path");
    expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
  });

  it("shows the hero, the failed path, and the search input", () => {
    renderAt("/no/such/route");
    expect(screen.getByTestId("nf-hero")).toBeInTheDocument();
    expect(screen.getByText("/no/such/route")).toBeInTheDocument();
    expect(screen.getByTestId("nf-search")).toBeInTheDocument();
  });

  it("submits the search form and navigates to /search", () => {
    renderAt("/missing");
    const input = screen.getByTestId("nf-search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "klondike" } });
    fireEvent.submit(input.closest("form")!);
    const probe = screen.getByTestId("loc");
    expect(probe.textContent).toContain("/search");
    expect(probe.textContent).toContain("q=klondike");
  });

  it("renders up to 3 suggestion entries for a near-match path", () => {
    // 'cribbage' shares a substring with multiple registered cribbage games,
    // so the suggester should surface a non-empty list capped at 3.
    renderAt("/play/cribbage");
    const items = screen.queryAllByTestId(/^nf-suggest-\d+$/);
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(3);
  });
});
