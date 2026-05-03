import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { RouteTransition } from "./RouteTransition.js";

// matchMedia polyfill — jsdom doesn't ship one. Each test controls
// whether `(prefers-reduced-motion: reduce)` returns matches=true.
function installMatchMedia(reduced: boolean): void {
  (window as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia = (
    query: string,
  ): MediaQueryList =>
    ({
      matches: reduced && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

function Navigator({ to }: { to: string }): null {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  return null;
}

describe("RouteTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children inside the transition wrapper", () => {
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <RouteTransition>
          <Routes>
            <Route path="/a" element={<div data-testid="page-a">A</div>} />
          </Routes>
        </RouteTransition>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("page-a")).toBeInTheDocument();
    expect(screen.getByTestId("page-a").closest(".route-transition")).not.toBeNull();
  });

  it("applies the fade-out phase class when the location changes", () => {
    const { container, rerender } = render(
      <MemoryRouter initialEntries={["/a"]}>
        <RouteTransition>
          <Routes>
            <Route path="/a" element={<div data-testid="page-a">A</div>} />
            <Route path="/b" element={<div data-testid="page-b">B</div>} />
          </Routes>
        </RouteTransition>
      </MemoryRouter>,
    );
    const root = container.querySelector(".route-transition") as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("data-route-phase")).toBe("idle");

    // Trigger a navigation by mounting a navigator into the same tree.
    rerender(
      <MemoryRouter initialEntries={["/a"]}>
        <Navigator to="/b" />
        <RouteTransition>
          <Routes>
            <Route path="/a" element={<div data-testid="page-a">A</div>} />
            <Route path="/b" element={<div data-testid="page-b">B</div>} />
          </Routes>
        </RouteTransition>
      </MemoryRouter>,
    );
    act(() => {
      // Flush the navigate effect; the component should enter the
      // outgoing fade phase but not yet have swapped children.
      vi.advanceTimersByTime(0);
    });
    const outRoot = container.querySelector(".route-transition") as HTMLElement;
    expect(outRoot.className).toContain("route-transition--out");
    expect(outRoot.getAttribute("data-route-phase")).toBe("out");
  });

  it("skips the transition when prefers-reduced-motion is set", () => {
    installMatchMedia(true);
    const { container, rerender } = render(
      <MemoryRouter initialEntries={["/a"]}>
        <RouteTransition>
          <Routes>
            <Route path="/a" element={<div data-testid="page-a">A</div>} />
            <Route path="/b" element={<div data-testid="page-b">B</div>} />
          </Routes>
        </RouteTransition>
      </MemoryRouter>,
    );

    rerender(
      <MemoryRouter initialEntries={["/a"]}>
        <Navigator to="/b" />
        <RouteTransition>
          <Routes>
            <Route path="/a" element={<div data-testid="page-a">A</div>} />
            <Route path="/b" element={<div data-testid="page-b">B</div>} />
          </Routes>
        </RouteTransition>
      </MemoryRouter>,
    );
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const root = container.querySelector(".route-transition") as HTMLElement;
    expect(root.className).not.toContain("route-transition--out");
    expect(root.className).not.toContain("route-transition--in");
    expect(root.getAttribute("data-route-phase")).toBe("idle");
    expect(screen.getByTestId("page-b")).toBeInTheDocument();
  });
});
