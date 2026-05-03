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

  it("dismissing the banner hides it for the rest of the session", () => {
    const { registration } = makeFakeRegistration();
    render(<UpdateBanner />);
    fireUpdateReady(registration);

    expect(screen.getByTestId("update-banner")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("update-dismiss"));

    // After dismiss the banner is unmounted in-memory; no localStorage,
    // no DOM remnants — purely component-state driven.
    expect(screen.queryByTestId("update-banner")).toBeNull();
    expect(screen.queryByTestId("update-refresh")).toBeNull();
    expect(screen.queryByTestId("update-dismiss")).toBeNull();
  });

  it("re-firing the SAME registration after dismiss does not re-render the banner mid-session", () => {
    const { registration } = makeFakeRegistration();
    render(<UpdateBanner />);
    fireUpdateReady(registration);

    fireEvent.click(screen.getByTestId("update-dismiss"));
    expect(screen.queryByTestId("update-banner")).toBeNull();

    // Same registration object → the user already said "Later" for THIS
    // exact build; firing the event again must not resurrect the banner.
    fireUpdateReady(registration);

    expect(screen.queryByTestId("update-banner")).toBeNull();
  });

  it("ignores update-ready events that carry no registration detail", () => {
    render(<UpdateBanner />);

    act(() => {
      window.dispatchEvent(new CustomEvent("cards:sw-update-ready", { detail: {} }));
    });
    act(() => {
      window.dispatchEvent(new CustomEvent("cards:sw-update-ready"));
    });

    expect(screen.queryByTestId("update-banner")).toBeNull();
  });

  it("dismiss is sticky: even a brand-new registration in the same session stays dismissed", () => {
    // Session-memory contract: once the user clicks "Later" we don't pester
    // them again until the next page load, regardless of how many additional
    // sw-update-ready events fire (e.g. multiple rapid rebuilds in dev).
    const { registration: first } = makeFakeRegistration();
    const { registration: second } = makeFakeRegistration();
    render(<UpdateBanner />);

    fireUpdateReady(first);
    fireEvent.click(screen.getByTestId("update-dismiss"));
    expect(screen.queryByTestId("update-banner")).toBeNull();

    fireUpdateReady(second);

    expect(screen.queryByTestId("update-banner")).toBeNull();
  });
});
