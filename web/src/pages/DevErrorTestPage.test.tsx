import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DevErrorTestPage from "./DevErrorTestPage.js";

// DevErrorTestPage throws synchronously during render to verify the per-page
// <ErrorBoundary>. We assert the throw itself (no boundary in these tests),
// silencing the noisy React console error logs that come from rendering a
// component that throws.

const FLAG_KEY = "__cardsForceError";
type FlagWindow = Window & { [FLAG_KEY]?: boolean };

describe("DevErrorTestPage", () => {
  let errorSpy: MockInstance;

  beforeEach(() => {
    // React logs the error to console.error when a component throws during
    // render; silence it so test output stays clean.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    // Ensure the fault-injection flag never leaks between tests.
    try {
      delete (window as FlagWindow)[FLAG_KEY];
    } catch {
      (window as FlagWindow)[FLAG_KEY] = false;
    }
  });

  it("throws synchronously during render with the expected error message", () => {
    expect(() =>
      render(
        <MemoryRouter>
          <DevErrorTestPage />
        </MemoryRouter>,
      ),
    ).toThrow(/intentional fault for ErrorBoundary verification/i);
  });

  it("clears the __cardsForceError flag on render (one-shot consumption)", () => {
    (window as FlagWindow)[FLAG_KEY] = true;
    expect((window as FlagWindow)[FLAG_KEY]).toBe(true);

    expect(() =>
      render(
        <MemoryRouter>
          <DevErrorTestPage />
        </MemoryRouter>,
      ),
    ).toThrow();

    // Flag must be cleared (either deleted or set to false) after render so a
    // subsequent recovery does not re-throw indefinitely.
    expect((window as FlagWindow)[FLAG_KEY]).not.toBe(true);
  });

  it("throws even when the force-error flag is not set", () => {
    // The route is documented to always throw on direct visit; flag is only
    // an additional trigger surface from Settings.
    expect((window as FlagWindow)[FLAG_KEY]).not.toBe(true);
    expect(() =>
      render(
        <MemoryRouter>
          <DevErrorTestPage />
        </MemoryRouter>,
      ),
    ).toThrow(Error);
  });

  it("exports a default function component", () => {
    expect(typeof DevErrorTestPage).toBe("function");
    expect(DevErrorTestPage.name).toBe("DevErrorTestPage");
  });
});
