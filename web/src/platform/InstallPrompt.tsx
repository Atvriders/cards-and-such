import { useEffect, useState } from "react";
import { track } from "./analytics.js";

/**
 * Captures the `beforeinstallprompt` event on supported browsers and surfaces
 * a small dismissible banner inviting the user to install the PWA.
 *
 * The browser-defined event carries a `prompt()` method that must be called
 * from a user-gesture handler — we stash the event and only call it from the
 * banner's "Install" button click.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "cards-install-dismissed";

export function InstallPrompt(): JSX.Element | null {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPrompt = (e: Event): void => {
      // Stop the browser's default mini-infobar so we can render our own UI.
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      track("install.shown");
    };
    const onInstalled = (): void => {
      // After install completes, hide the banner and clear the cached event.
      setEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = (): void => {
    setDismissed(true);
    track("install.dismiss");
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* localStorage unavailable — accept that the banner re-appears next session */
    }
  };

  const accept = async (): Promise<void> => {
    if (!evt) return;
    track("install.accept");
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch {
      /* User cancelled or browser refused — fall through and dismiss */
    } finally {
      setEvt(null);
      // Treat any interaction as a dismiss so we don't re-prompt on the next visit.
      try {
        window.localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  };

  if (dismissed || !evt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Cards and Such"
      data-testid="install-prompt"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 0.85rem",
        borderRadius: "0.6rem",
        background: "#0b3a23",
        color: "#e6f7ec",
        border: "1px solid #1a6c3f",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        fontSize: "0.9rem",
        maxWidth: "min(92vw, 28rem)",
      }}
    >
      <span>Install Cards & Such for offline play</span>
      <button
        type="button"
        data-testid="install-prompt-accept"
        onClick={() => void accept()}
        style={{
          padding: "0.35rem 0.7rem",
          borderRadius: "0.35rem",
          border: "1px solid #2c8a55",
          background: "#1a6c3f",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Install
      </button>
      <button
        type="button"
        data-testid="install-prompt-dismiss"
        aria-label="Dismiss install prompt"
        onClick={dismiss}
        style={{
          padding: "0.35rem 0.55rem",
          borderRadius: "0.35rem",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "transparent",
          color: "#e6f7ec",
          cursor: "pointer",
        }}
      >
        Not now
      </button>
    </div>
  );
}

export default InstallPrompt;
