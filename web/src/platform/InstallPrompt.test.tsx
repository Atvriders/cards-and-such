import { describe, it, expect, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { InstallPrompt } from "./InstallPrompt.js";

const DISMISS_KEY = "cards-install-dismissed";

/**
 * jsdom does not fire the `beforeinstallprompt` event natively, so we
 * synthesise an Event with the extra fields the component reads
 * (`prompt`, `userChoice`, `platforms`) and dispatch it on `window`.
 */
function fireBeforeInstallPrompt(): void {
  const evt = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    platforms: string[];
  };
  evt.prompt = () => Promise.resolve();
  evt.userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });
  evt.platforms = ["web"];
  act(() => {
    window.dispatchEvent(evt);
  });
}

describe("InstallPrompt", () => {
  beforeEach(() => {
    window.localStorage.removeItem(DISMISS_KEY);
  });

  it("renders the install banner after a beforeinstallprompt event", () => {
    render(<InstallPrompt />);
    // Before the event fires, nothing is rendered.
    expect(screen.queryByTestId("install-prompt")).toBeNull();

    fireBeforeInstallPrompt();

    expect(screen.getByTestId("install-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("install-prompt-accept")).toBeInTheDocument();
    expect(screen.getByTestId("install-prompt-dismiss")).toBeInTheDocument();
  });

  it("dismiss button hides the banner and persists the choice in localStorage", () => {
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    fireEvent.click(screen.getByTestId("install-prompt-dismiss"));

    expect(screen.queryByTestId("install-prompt")).toBeNull();
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe("1");
  });
});
