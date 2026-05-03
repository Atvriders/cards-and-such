import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryPage from "./CategoryPage.js";

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/category/:cat" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CategoryPage smoke", () => {
  it("renders without crashing for a valid category", () => {
    renderAt("/category/solitaire");
    expect(screen.getByTestId("category-page-solitaire")).toBeInTheDocument();
  });

  it("shows hero, breadcrumb, and filter chips for a valid category", () => {
    renderAt("/category/solitaire");
    expect(screen.getByTestId("cat-header")).toBeInTheDocument();
    expect(screen.getByTestId("cat-crumb-lobby")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("cat-filter-chips")).toBeInTheDocument();
    expect(screen.getByTestId("cat-filter-all")).toBeInTheDocument();
  });

  it("switches filter when a chip is clicked and renders unknown for invalid slug", () => {
    renderAt("/category/solitaire");
    const quickChip = screen.getByTestId("cat-filter-quick");
    fireEvent.click(quickChip);
    expect(quickChip).toHaveAttribute("aria-selected", "true");

    // Unknown category renders a friendly fallback.
    render(
      <MemoryRouter initialEntries={["/category/not-a-real-cat"]}>
        <Routes>
          <Route path="/category/:cat" element={<CategoryPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("cat-unknown")).toBeInTheDocument();
  });
});
