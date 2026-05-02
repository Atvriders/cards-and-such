import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPage, { _buildExportSnapshot } from "./SettingsPage.js";
import { KNOWN_KEYS } from "../platform/userdata.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>,
  );
}

describe("SettingsPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the four sectioned cards", () => {
    renderPage();
    expect(screen.getByTestId("settings-section-appearance")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-audio")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-gameplay")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-data")).toBeInTheDocument();
  });

  it("exposes export / import / clear actions", () => {
    renderPage();
    expect(screen.getByTestId("settings-export")).toBeInTheDocument();
    expect(screen.getByTestId("settings-import")).toBeInTheDocument();
    expect(screen.getByTestId("settings-clear")).toBeInTheDocument();
  });

  it("toggles sound preference and persists to localStorage", () => {
    localStorage.setItem("cards-sound-on", "true");
    renderPage();
    const toggle = screen.getByTestId("sound-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
  });

  it("changes the card-back swatch and persists it", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("card-back-red-weave"));
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
  });

  it("per-section reset reverts that section to defaults without touching others", () => {
    localStorage.setItem("cards-sound-on", "false");
    localStorage.setItem("cards-card-back", "red-weave");
    localStorage.setItem("cards-ratings", '{"klondike":4}');
    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-audio"));
    // Sound effect re-writes the state to default ("true").
    expect(localStorage.getItem("cards-sound-on")).toBe("true");
    // Other sections' data is untouched.
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4}');
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
  });

  it("export builds a JSON snapshot of every known key currently stored", () => {
    localStorage.setItem("cards-card-back", "plain");
    localStorage.setItem("cards-ratings", '{"klondike":4}');
    localStorage.setItem("not-our-key", "ignore-me");
    const snap = _buildExportSnapshot();
    expect(snap.app).toBe("cards-and-such");
    expect(snap.version).toBeGreaterThan(0);
    expect(snap.data["cards-card-back"]).toBe("plain");
    expect(snap.data["cards-ratings"]).toBe('{"klondike":4}');
    expect(snap.data["not-our-key"]).toBeUndefined();
    // Every exported key must be on the KNOWN_KEYS list.
    for (const k of Object.keys(snap.data)) {
      expect(KNOWN_KEYS).toContain(k);
    }
  });

  it("clear-all aborts when the user cancels the confirm dialog", async () => {
    localStorage.setItem("cards-ratings", '{"klondike":4}');
    renderPage();
    fireEvent.click(screen.getByTestId("settings-clear"));
    // The dialog must appear and offer a Cancel button.
    const cancel = await screen.findByTestId("confirm-no");
    fireEvent.click(cancel);
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4}');
  });

  it("clear-all requires typing DELETE before confirm activates", async () => {
    localStorage.setItem("cards-ratings", '{"klondike":4}');
    localStorage.setItem("cards-best-times", '{"freecell":120}');
    renderPage();
    fireEvent.click(screen.getByTestId("settings-clear"));
    const yes = (await screen.findByTestId("confirm-yes")) as HTMLButtonElement;
    // Confirm starts disabled until the user types the magic word.
    expect(yes.disabled).toBe(true);
    const input = screen.getByTestId("confirm-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "DELETE" } });
    expect(yes.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(yes);
    });
    // Pref keys may be re-written to defaults by render-effects; stats /
    // ratings are not auto-re-written, so they should remain null.
    expect(localStorage.getItem("cards-ratings")).toBeNull();
    expect(localStorage.getItem("cards-best-times")).toBeNull();
  });

  it("renders the confirm dialog with title and message", async () => {
    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-ratings"));
    const dlg = await screen.findByTestId("confirm-dialog");
    expect(dlg).toBeInTheDocument();
    expect(dlg.getAttribute("role")).toBe("alertdialog");
  });
});
