import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { UpdateBanner } from "./UpdateBanner.js";

/**
 * Build a fake ServiceWorkerRegistration whose `waiting` worker captures any
 * postMessage calls so we can assert the SKIP_WAITING handshake.
 */
function makeFakeRegistration(): {
  registration: ServiceWorkerRegistration;
  postMessage: ReturnType<typeof vi.fn>;
} {
  const postMessage = vi.fn();
  const waiting = { postMessage } as unknown as ServiceWorker;
  const registration = { waiting } as unknown as ServiceWorkerRegistration;
  return { registration, postMessage };
}

function fireUpdateReady(registration: ServiceWorkerRegistration): void {
  act(() => {
    window.dispatchEvent(
      new CustomEvent("cards:sw-update-ready", { detail: { registration } }),
    );
  });
}

describe("UpdateBanner", () => {
  let originalServiceWorker: PropertyDescriptor | undefined;

  beforeEach(() => {
    // jsdom doesn't ship navigator.serviceWorker; the refresh path needs
    // addEventListener("controllerchange", ...) to be callable. Stub it.
    originalServiceWorker = Object.getOwnPropertyDescriptor(
      navigator,
      "serviceWorker",
    );
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, "serviceWorker", originalServiceWorker);
    } else {
      delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    }
  });

  it("renders the update banner after a cards:sw-update-ready event", () => {
    const { registration } = makeFakeRegistration();
    render(<UpdateBanner />);

    expect(screen.queryByTestId("update-banner")).toBeNull();

    fireUpdateReady(registration);

    expect(screen.getByTestId("update-banner")).toBeInTheDocument();
    expect(screen.getByTestId("update-refresh")).toBeInTheDocument();
  });

  it("Refresh button posts SKIP_WAITING to the waiting service worker", () => {
    const { registration, postMessage } = makeFakeRegistration();
    render(<UpdateBanner />);
    fireUpdateReady(registration);

    fireEvent.click(screen.getByTestId("update-refresh"));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });
});
