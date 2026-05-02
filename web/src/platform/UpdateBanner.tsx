import { useEffect, useState } from "react";

/**
 * Listens for `cards:sw-update-ready` (dispatched from main.tsx when a new
 * service worker is parked in `waiting`) and renders a small bottom-of-screen
 * banner inviting the user to refresh.
 *
 * Clicking "Refresh" posts a `SKIP_WAITING` message to the waiting worker;
 * once it activates, the browser fires `controllerchange` and we reload the
 * page so the new assets take effect. "Later" simply hides the banner —
 * the user will be prompted again on the next visit if the update is
 * still pending.
 */
type UpdateReadyDetail = { registration: ServiceWorkerRegistration };

export function UpdateBanner(): JSX.Element | null {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onReady = (e: Event): void => {
      const detail = (e as CustomEvent<UpdateReadyDetail>).detail;
      if (detail && detail.registration) {
        setRegistration(detail.registration);
        // A new update should override a previous "Later" dismissal —
        // the user explicitly said "later for THIS one"; a newer build
        // is a fresh prompt.
        setDismissed(false);
      }
    };
    window.addEventListener("cards:sw-update-ready", onReady as EventListener);
    return () =>
      window.removeEventListener("cards:sw-update-ready", onReady as EventListener);
  }, []);

  const refresh = (): void => {
    if (!registration || !registration.waiting) return;
    // Reload as soon as the new worker takes control. We attach the
    // listener BEFORE posting the message to avoid a race where
    // controllerchange fires before we're listening.
    const onControllerChange = (): void => {
      // Guard against multiple fires by detaching ourselves.
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  };

  const dismiss = (): void => setDismissed(true);

  if (!registration || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="update-banner"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        // Sits one above InstallPrompt's z-index (60) so a stacking
        // collision still leaves the update notice on top — updates are
        // higher-signal than install nudges.
        zIndex: 70,
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
      <span>A new version is ready. Refresh to install.</span>
      <button
        type="button"
        data-testid="update-refresh"
        onClick={refresh}
        style={{
          padding: "0.35rem 0.7rem",
          borderRadius: "0.35rem",
          border: "1px solid #2c8a55",
          background: "#1a6c3f",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Refresh
      </button>
      <button
        type="button"
        data-testid="update-dismiss"
        aria-label="Dismiss update prompt"
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
        Later
      </button>
    </div>
  );
}

export default UpdateBanner;
