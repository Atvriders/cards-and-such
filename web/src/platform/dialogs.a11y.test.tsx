import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog.js";
import { KeyboardShortcutsModal } from "./KeyboardShortcuts.js";
import { WelcomeTutorial } from "./Tutorial.js";
import { HowToPlayModal } from "./HowToPlayModal.js";

/**
 * Shared a11y contract assertions for every modal/dialog surface in
 * `web/src/platform/`. Each dialog must:
 *   1. Carry `role="dialog"` (or `alertdialog`)
 *   2. Set `aria-modal="true"`
 *   3. Set `aria-labelledby` pointing at an in-document heading element
 *   4. Trap Tab focus inside the dialog (Tab on the last focusable wraps to
 *      the first; Shift+Tab on the first wraps to the last).
 *
 * The trap assertion deliberately validates *behaviour* rather than the
 * specific hook implementation so we don't tie tests to internals — three
 * of the four dialogs use `useFocusTrap`, and HowToPlayModal hand-rolls an
 * equivalent Tab handler. Both must satisfy the same observable contract.
 */
function assertDialogContract(dialog: HTMLElement): void {
  // (1) role = dialog | alertdialog
  const role = dialog.getAttribute("role");
  expect(role === "dialog" || role === "alertdialog").toBe(true);

  // (2) aria-modal = "true"
  expect(dialog.getAttribute("aria-modal")).toBe("true");

  // (3) aria-labelledby points at an in-document element with non-empty text
  const labelledById = dialog.getAttribute("aria-labelledby");
  expect(labelledById, "aria-labelledby must be set").toBeTruthy();
  const labelEl = document.getElementById(labelledById!);
  expect(labelEl, `element with id="${labelledById}" must exist`).not.toBeNull();
  expect(labelEl!.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  // Heading-ish: matches an h1-h6 (or has a heading role)
  const isHeading =
    /^H[1-6]$/.test(labelEl!.tagName) ||
    labelEl!.getAttribute("role") === "heading";
  expect(isHeading).toBe(true);
}

function assertTabTrap(dialog: HTMLElement): void {
  // Collect focusables inside the dialog using the same selector the
  // platform's focus-trap implementations use.
  const focusables = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (n) => !n.hasAttribute("disabled") && n.getAttribute("aria-hidden") !== "true",
  );
  expect(focusables.length).toBeGreaterThan(0);
  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;

  // Tab from last → wraps to first.
  act(() => last.focus());
  fireEvent.keyDown(dialog, { key: "Tab" });
  // The trap dispatches on document with capture; some impls listen on
  // document directly, so also dispatch there.
  fireEvent.keyDown(document, { key: "Tab" });
  expect(document.activeElement).toBe(first);

  // Shift+Tab from first → wraps to last.
  act(() => first.focus());
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(last);
}

describe("platform dialogs — a11y modal contract", () => {
  it("ConfirmDialog satisfies the dialog contract", () => {
    render(
      <ConfirmDialog
        open
        title="Delete account"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const dialog = screen.getByTestId("confirm-dialog");
    assertDialogContract(dialog);
    assertTabTrap(dialog);
  });

  it("KeyboardShortcutsModal satisfies the dialog contract", () => {
    render(<KeyboardShortcutsModal open onClose={() => {}} />);
    // The modal element is the inner .kbd-modal (role=dialog), not the backdrop.
    const dialog = document.querySelector<HTMLElement>('.kbd-modal[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    assertDialogContract(dialog);
    assertTabTrap(dialog);
  });

  it("WelcomeTutorial card satisfies the dialog contract", () => {
    render(<WelcomeTutorial onComplete={() => {}} onSkip={() => {}} />);
    const dialog = screen.getByTestId("tut-step-1");
    assertDialogContract(dialog);
    assertTabTrap(dialog);
  });

  it("HowToPlayModal satisfies the dialog contract", () => {
    render(
      <HowToPlayModal
        open
        onClose={() => {}}
        title="Klondike"
        text={"# Goal\nMove all cards to the foundations.\n\n# Tips\n- Build down by alternating colours."}
      />,
    );
    const dialog = screen.getByTestId("htp-modal");
    assertDialogContract(dialog);
    assertTabTrap(dialog);
  });
});
