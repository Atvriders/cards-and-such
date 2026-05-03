import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { useEffect } from "react";
import {
  KeyboardShortcutsModal,
  useKeyboardShortcutsModal,
} from "./KeyboardShortcuts.js";

/**
 * Tiny wrapper exercising both the hook and the modal together so we cover
 * the full "press ? -> overlay opens" path without leaking React state
 * between tests (each render gets a fresh hook instance).
 */
function Harness(): JSX.Element {
  const api = useKeyboardShortcutsModal();
  // Expose the open state on a data-attr so assertions can read it without
  // poking React internals.
  useEffect(() => {
    document.body.dataset.kbdOpen = api.open ? "1" : "0";
  }, [api.open]);
  return <KeyboardShortcutsModal open={api.open} onClose={api.close} />;
}

/**
 * Mirrors the AppShell footer wiring: a real <button data-testid=
 * "footer-shortcuts-btn"> calling `shortcuts.setOpen(true)`. We re-create the
 * binding here (rather than rendering AppShell) so the unit test stays focused
 * on the hook+modal contract that the footer relies on.
 */
function FooterHarness(): JSX.Element {
  const api = useKeyboardShortcutsModal();
  return (
    <>
      <button
        type="button"
        data-testid="footer-shortcuts-btn"
        onClick={() => api.setOpen(true)}
      >
        Shortcuts
      </button>
      <KeyboardShortcutsModal open={api.open} onClose={api.close} />
    </>
  );
}

describe("KeyboardShortcutsModal", () => {
  it("opens when '?' is pressed and renders all sections", () => {
    render(<Harness />);
    expect(screen.queryByTestId("kbd-modal")).toBeNull();
    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });
    expect(screen.getByTestId("kbd-modal")).toBeTruthy();
    expect(screen.getByTestId("kbd-section-global")).toBeTruthy();
    expect(screen.getByTestId("kbd-section-lobby")).toBeTruthy();
    expect(screen.getByTestId("kbd-section-play")).toBeTruthy();
    // First row of each section should be present (one per section).
    const firstRows = screen.getAllByTestId("kbd-row-0");
    expect(firstRows.length).toBeGreaterThanOrEqual(3);
  });

  it("opens when Shift+/ is pressed (layouts where '?' is shifted slash)", () => {
    render(<Harness />);
    act(() => {
      fireEvent.keyDown(window, { key: "/", shiftKey: true });
    });
    expect(screen.getByTestId("kbd-modal")).toBeTruthy();
  });

  it("ignores '?' when typed into an input", () => {
    render(
      <>
        <input data-testid="some-input" />
        <Harness />
      </>,
    );
    const input = screen.getByTestId("some-input");
    input.focus();
    act(() => {
      fireEvent.keyDown(input, { key: "?", bubbles: true });
    });
    expect(screen.queryByTestId("kbd-modal")).toBeNull();
  });

  it("closes via Esc and via the close button", () => {
    render(<Harness />);
    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });
    expect(screen.getByTestId("kbd-modal")).toBeTruthy();
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(screen.queryByTestId("kbd-modal")).toBeNull();

    // Reopen and click the X button.
    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });
    fireEvent.click(screen.getByTestId("kbd-close"));
    expect(screen.queryByTestId("kbd-modal")).toBeNull();
  });

  it("closes on backdrop click but ignores clicks inside the dialog", () => {
    render(<Harness />);
    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    // Still open — clicks inside the dialog don't bubble to the backdrop.
    expect(screen.getByTestId("kbd-modal")).toBeTruthy();
    fireEvent.click(screen.getByTestId("kbd-modal"));
    expect(screen.queryByTestId("kbd-modal")).toBeNull();
  });

  it("exposes accessible dialog semantics (role, aria-modal, label)", () => {
    render(<KeyboardShortcutsModal open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("kbd-modal-title");
    expect(screen.getByText("Keyboard Shortcuts")).toBeTruthy();
  });

  it("opens the modal when the footer Shortcuts button is clicked", () => {
    render(<FooterHarness />);
    expect(screen.queryByTestId("kbd-modal")).toBeNull();
    fireEvent.click(screen.getByTestId("footer-shortcuts-btn"));
    expect(screen.getByTestId("kbd-modal")).toBeTruthy();
    // Sanity: the same dialog semantics surface from the footer entry point.
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("renders all three sections (Global / Lobby / Play) with >=1 row each", () => {
    render(<KeyboardShortcutsModal open onClose={() => {}} />);
    for (const id of ["global", "lobby", "play"] as const) {
      const section = screen.getByTestId(`kbd-section-${id}`);
      expect(section).toBeTruthy();
      // aria-labelledby points at the heading id so the section is named.
      expect(section.getAttribute("aria-labelledby")).toBe(
        `kbd-section-${id}-heading`,
      );
      const rows = within(section).getAllByTestId(/^kbd-row-\d+$/);
      expect(rows.length).toBeGreaterThanOrEqual(1);
    }
  });
});
