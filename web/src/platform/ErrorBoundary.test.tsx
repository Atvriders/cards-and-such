import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary.js";
import {
  ANALYTICS_STORAGE_KEY,
  clearEvents,
  getEvents,
} from "./analytics.js";

/** Tiny throwing component used to drive the boundary. */
function Boom({ message = "kaboom" }: { message?: string }): JSX.Element {
  throw new Error(message);
}

/** Healthy child for the happy path. */
function Ok(): JSX.Element {
  return <div data-testid="happy">OK</div>;
}

describe("ErrorBoundary", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    // The analytics ring is module-level, so clear it explicitly to keep
    // each test isolated even though multiple tests trigger error.caught.
    clearEvents();
    // React logs caught errors via console.error during rendering. Silence
    // it so the test output stays readable; we still assert on the
    // analytics ring buffer for the actual signal.
    errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {}) as unknown as ReturnType<typeof vi.spyOn>;
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("renders children when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <Ok />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("happy")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary")).toBeNull();
  });

  it("shows the fallback card with the error message when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom message="explosive failure" />
      </ErrorBoundary>,
    );
    const card = screen.getByTestId("error-boundary");
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent("Something broke");
    expect(screen.getByTestId("error-message")).toHaveTextContent("explosive failure");
  });

  it("exposes a Reload button and a Report bug link with stable test ids", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    const reload = screen.getByTestId("error-reload");
    const report = screen.getByTestId("error-report");
    expect(reload.tagName).toBe("BUTTON");
    expect(report.tagName).toBe("A");
    expect(report.getAttribute("href")).toContain("github.com");
    expect(report.getAttribute("href")).toContain("/issues");
    expect(report.getAttribute("target")).toBe("_blank");
  });

  it("Reload click invokes window.location.reload", () => {
    const reloadMock = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    try {
      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );
      fireEvent.click(screen.getByTestId("error-reload"));
      expect(reloadMock).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  it("logs error.caught via the analytics ring buffer", () => {
    render(
      <ErrorBoundary scope="play-surface">
        <Boom message="ring-buffer-marker" />
      </ErrorBoundary>,
    );
    const events = getEvents();
    const caught = events.find((e) => e.name === "error.caught");
    expect(caught).toBeDefined();
    expect(caught?.props?.message).toBe("ring-buffer-marker");
    expect(caught?.props?.scope).toBe("play-surface");
    expect(typeof caught?.props?.stack).toBe("string");
  });

  it("honours custom title and hint props", () => {
    render(
      <ErrorBoundary title="The app hit a snag" hint="custom hint here">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("error-boundary")).toHaveTextContent("The app hit a snag");
    expect(screen.getByTestId("error-boundary")).toHaveTextContent("custom hint here");
  });
});
