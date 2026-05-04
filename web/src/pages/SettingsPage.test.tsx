import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock the platform sounds module so the Test-sounds panel tests can
// assert that `playSound()` is invoked without firing Web Audio in jsdom.
// We preserve every other export (constants like LS_SOUND_ON, types) so
// SettingsPage's other imports continue to resolve.
vi.mock("../platform/sounds.js", async () => {
  const actual = await vi.importActual<typeof import("../platform/sounds.js")>(
    "../platform/sounds.js",
  );
  return { ...actual, playSound: vi.fn() };
});

import SettingsPage, { _buildExportSnapshot } from "./SettingsPage.js";
import { KNOWN_KEYS } from "../platform/userdata.js";
import { applyLightMode } from "../platform/lightMode.js";
import { playSound } from "../platform/sounds.js";

// Helper: stub window.matchMedia so the SettingsPage's mobile detection
// can be flipped per-test. jsdom doesn't ship a matchMedia implementation,
// so without this the page falls back to its desktop default (`false`).
function setMatchMedia(mobile: boolean): void {
  const mql = {
    matches: mobile,
    media: "(max-width: 600px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => mql),
  });
}

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

  // W880 — focused coverage of the page-level H1. SettingsPage renders an
  // accessible title via `<h1>{t("settings.title")}</h1>` inside the
  // `.settings-header` block (i18n key resolves to "Settings"). Every
  // other test in this suite reaches into section-scoped controls via
  // testids and the H2 sub-section headings, so a regression that lost
  // the page-level H1 (e.g. a layout refactor that moved the title into
  // the global app shell) would slip through unnoticed. Pinning the H1
  // by role + level keeps the document outline contract explicit.
  it("renders an h1 page heading with the settings title", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Settings" }),
    ).toBeInTheDocument();
  });

  // W885 — focused coverage of the Audio section's H2 sub-heading. W880
  // pinned the page-level H1, but the four section cards each render an
  // <h2> that the section <section aria-labelledby> attribute references
  // for accessible naming. Every other test reaches into Audio via
  // testids (sound-toggle, settings-volume, settings-mute-on-hidden) and
  // never asserts the heading itself, so a regression that demoted the
  // h2 to a div or renamed the heading would silently break the document
  // outline + the section's accessible name. Pinning by role + level + name
  // keeps that contract explicit.
  it("renders an h2 Audio section heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 2, name: "Audio" }),
    ).toBeInTheDocument();
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

  // W762 — focused coverage of the Gameplay > Auto-move toggle. Other
  // tests only assert the testid exists (accordion) or that the storage
  // key gets cleared on per-section reset; nothing exercises the
  // checkbox's two-way interactive behavior. This test verifies the
  // default-on render, an Off click that flips both the checkbox state
  // and the visible "On"/"Off" label while persisting "false" to
  // `cards-auto-move`, and a second click that flips it back to On with
  // the inverse persisted value. Catches regressions where the onChange
  // disconnects from setAutoMove or the persistence useEffect stops
  // mirroring state to localStorage.
  it("toggles auto-move preference, updates the visible label, and persists in both directions", () => {
    renderPage();
    const toggle = screen.getByTestId("settings-auto-move") as HTMLInputElement;
    // Default: auto-move is on. The mount effect mirrors that to storage.
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-auto-move")).toBe("true");
    // The sibling .settings-toggle-label should reflect the live state.
    expect(toggle.closest("label")?.textContent).toContain("On");
    // Click off — checkbox flips, label re-renders, storage rewrites.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-auto-move")).toBe("false");
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // Click back on — full round-trip.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-auto-move")).toBe("true");
    expect(toggle.closest("label")?.textContent).toContain("On");
  });

  // W776 — focused coverage of the Gameplay > Hints toggle. Other tests
  // only seed `cards-hints-enabled` for the per-section reset assertions;
  // nothing exercises the checkbox's interactive flip. This pairs with
  // the in-game hint coverage (W692/W698 hint visibility, W702 cooldown)
  // by verifying the upstream Settings switch that gates them: default-on
  // render, a click that flips checkbox + visible "On"/"Off" label while
  // persisting "false" to `cards-hints-enabled`, and a return click that
  // round-trips back to On. Catches regressions where the onChange
  // disconnects from setHintsEnabled or the persistence useEffect stops
  // mirroring state to localStorage.
  it("toggles hints-enabled preference, updates the visible label, and persists in both directions", () => {
    renderPage();
    const toggle = screen.getByTestId("settings-hints-enabled") as HTMLInputElement;
    // Default: hints are enabled. The mount effect mirrors that to storage.
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-hints-enabled")).toBe("true");
    // The sibling .settings-toggle-label should reflect the live state.
    expect(toggle.closest("label")?.textContent).toContain("On");
    // Click off — checkbox flips, label re-renders, storage rewrites.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-hints-enabled")).toBe("false");
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // Click back on — full round-trip.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-hints-enabled")).toBe("true");
    expect(toggle.closest("label")?.textContent).toContain("On");
  });

  // W793 — focused coverage of the Gameplay > Show undo count toggle.
  // Other tests only seed `cards-show-undo-count` for the per-section
  // reset assertions; nothing exercises the checkbox's interactive flip.
  // This pairs with the in-game Undo/Redo coverage (W498 reactive label,
  // hotkey/button tests) by verifying the upstream Settings switch that
  // gates the "Undo (N)" label: default-off render, a click that flips
  // checkbox + visible "Off"/"On" label while persisting "true" to
  // `cards-show-undo-count`, and a return click that round-trips back
  // to Off. Catches regressions where the onChange disconnects from
  // setShowUndoCount or the persistence useEffect stops mirroring state
  // to localStorage.
  it("toggles show-undo-count preference, updates the visible label, and persists in both directions", () => {
    renderPage();
    const toggle = screen.getByTestId("settings-show-undo-count") as HTMLInputElement;
    // Default: show-undo-count is off. The mount effect mirrors that to storage.
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-show-undo-count")).toBe("false");
    // The sibling .settings-toggle-label should reflect the live state.
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // Click on — checkbox flips, label re-renders, storage rewrites.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-show-undo-count")).toBe("true");
    expect(toggle.closest("label")?.textContent).toContain("On");
    // Click back off — full round-trip.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-show-undo-count")).toBe("false");
    expect(toggle.closest("label")?.textContent).toContain("Off");
  });

  // W819 — focused coverage of the Appearance > Light mode toggle. Light
  // mode is a *separate* binary setting from the theme picker (W668): it
  // flips a `data-light` attribute on `<html>` and persists "1"/"0" under
  // `cards-light-mode` (note the non-boolean storage shape — see
  // lightMode.ts). Other tests only seed the key for per-section reset
  // assertions; nothing exercises the checkbox's interactive flip. This
  // covers default-off render (jsdom has no matchMedia, so first-time
  // users land on dark), a click that flips checkbox + visible "On"/"Off"
  // label while persisting "1" AND setting `data-light="1"` on the root,
  // and a return click that clears `data-light` and persists "0".
  // Catches regressions where the onChange disconnects from setLight or
  // the applyLightMode useEffect stops mirroring state to storage + DOM.
  it("toggles light-mode preference, updates data-light + label, and persists in both directions", () => {
    // Ensure no leftover seed leaks in from a sibling test.
    delete document.documentElement.dataset.light;
    renderPage();
    const toggle = screen.getByTestId("settings-light-mode") as HTMLInputElement;
    // Default: light mode is off. The mount effect mirrors that to storage
    // ("0", not "false" — light mode uses a 1/0 shape) and leaves
    // data-light absent on the root element.
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-light-mode")).toBe("0");
    expect(document.documentElement.dataset.light).toBeUndefined();
    // The sibling .settings-toggle-label should reflect the live state.
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // Click on — checkbox flips, label re-renders, storage rewrites,
    // root gets data-light="1".
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-light-mode")).toBe("1");
    expect(document.documentElement.dataset.light).toBe("1");
    expect(toggle.closest("label")?.textContent).toContain("On");
    // Click back off — full round-trip: data-light is removed again.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-light-mode")).toBe("0");
    expect(document.documentElement.dataset.light).toBeUndefined();
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // Tidy: don't leak data-light into sibling tests.
    delete document.documentElement.dataset.light;
  });

  it("changes the card-back swatch and persists it", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("card-back-red-weave"));
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
  });

  // W743 — the visible card-back gallery (`cardback-gallery-<id>`) is the
  // user-facing swatch picker; older tests only exercise the hidden legacy
  // buttons (`card-back-<id>`) and assert localStorage. This covers the
  // visual selection state: the default tile (bicycle-weave) starts with
  // aria-checked=true, and clicking a different gallery tile both flips
  // aria-checked on the tiles AND writes the new id to `cards-card-back`.
  // Catches regressions where the gallery onClick disconnects from
  // setCardBack or the selected/aliasMatch logic stops marking the active
  // tile.
  it("gallery swatch click flips aria-checked and persists the new card-back", () => {
    renderPage();
    const defaultTile = screen.getByTestId("cardback-gallery-bicycle-weave");
    const tartanTile = screen.getByTestId("cardback-gallery-tartan");
    // Default render — bicycle-weave is the active tile, tartan is not.
    expect(defaultTile.getAttribute("aria-checked")).toBe("true");
    expect(tartanTile.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(tartanTile);
    // localStorage was rewritten and selection moved to the clicked tile.
    expect(localStorage.getItem("cards-card-back")).toBe("tartan");
    expect(tartanTile.getAttribute("aria-checked")).toBe("true");
    expect(defaultTile.getAttribute("aria-checked")).toBe("false");
  });

  it("theme picker persists choice to localStorage and applies data-theme to root", () => {
    // Mount on the default theme ("midnight"); the persistence effect
    // writes that id to storage on first render. Clicking a different
    // theme chip must rewrite `cards-bg-theme` and stamp
    // `<html data-theme="...">` so engine CSS picks up the new vars.
    renderPage();
    expect(localStorage.getItem("cards-bg-theme")).toBe("midnight");
    expect(document.documentElement.getAttribute("data-theme")).toBe("midnight");
    fireEvent.click(screen.getByTestId("theme-row-emerald"));
    expect(localStorage.getItem("cards-bg-theme")).toBe("emerald");
    expect(document.documentElement.getAttribute("data-theme")).toBe("emerald");
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

  // W750 — the snapshot test above only exercises the synchronous helper.
  // This covers the actual user-driven export click flow: the
  // `settings-export` button must invoke handleExport -> downloadExport,
  // which builds an application/json Blob via URL.createObjectURL and
  // triggers a synthetic anchor download. Catches regressions where the
  // button onClick disconnects from downloadExport, the Blob's MIME type
  // changes, or stored user data (favorites/best-times) stops landing in
  // the exported payload.
  it("clicking settings-export creates a JSON Blob download containing user data", async () => {
    // Seed two well-known user-data keys so the exported Blob payload
    // has something distinctive to assert on.
    localStorage.setItem("cards-favorites", '["klondike","freecell"]');
    localStorage.setItem("cards-best-times", '{"freecell":120}');

    // jsdom doesn't implement URL.createObjectURL/revokeObjectURL —
    // capture the Blob argument so we can verify the export payload, and
    // stub the synthetic anchor click so jsdom doesn't try to navigate.
    let capturedBlob: Blob | null = null;
    const createObj = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-export-url";
    });
    const revokeObj = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = createObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = revokeObj;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderPage();

    act(() => {
      fireEvent.click(screen.getByTestId("settings-export"));
    });

    // downloadExport: one Blob URL, one synthetic anchor click.
    expect(createObj).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // Inspect the Blob: application/json MIME tag, with the seeded user
    // data round-tripped through JSON.stringify(exportAll()).
    expect(capturedBlob).not.toBeNull();
    const blob = capturedBlob as unknown as Blob;
    expect(blob.type).toContain("application/json");
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    const parsed = JSON.parse(text) as {
      app: string;
      data: Record<string, string>;
    };
    expect(parsed.app).toBe("cards-and-such");
    expect(parsed.data["cards-favorites"]).toBe('["klondike","freecell"]');
    expect(parsed.data["cards-best-times"]).toBe('{"freecell":120}');

    clickSpy.mockRestore();
  });

  // W758 — inverse of the W750 export test. Confirms the import flow
  // reads a JSON file from the hidden file input, validates the
  // `{ app, data }` shape via importAll, writes recognized keys back to
  // localStorage, and stamps the "Importer" achievement flag. Catches
  // regressions where handleImportFile silently drops the file, skips
  // the confirm-yes wiring, or stops calling importAll altogether.
  it("import restores user data from a JSON file backup", async () => {
    // Empty localStorage at the start — the import is the only writer.
    expect(localStorage.getItem("cards-favorites")).toBeNull();
    expect(localStorage.getItem("cards-ratings")).toBeNull();
    expect(localStorage.getItem("cards-best-times")).toBeNull();

    renderPage();

    // Build a JSON payload matching the export shape. Three KNOWN_KEYS
    // entries plus an unknown key that importAll should silently skip.
    const payload = {
      version: 1,
      exportedAt: "2026-05-03T00:00:00.000Z",
      app: "cards-and-such",
      data: {
        "cards-favorites": '["klondike","freecell"]',
        "cards-ratings": '{"klondike":4}',
        "cards-best-times": '{"freecell":120}',
        "not-a-known-key": "ignored",
      },
    };
    const json = JSON.stringify(payload);
    const file = new File([json], "backup.json", {
      type: "application/json",
    });
    // jsdom 24's File doesn't ship a working `.text()` (handleImportFile
    // uses `await file.text()`); pin the read to our seeded payload so
    // the production code path resolves in the test environment.
    Object.defineProperty(file, "text", {
      configurable: true,
      value: () => Promise.resolve(json),
    });

    const input = screen.getByTestId(
      "settings-import-input",
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // The handler asks for confirmation before overwriting — click yes.
    const yes = await screen.findByTestId("confirm-yes");
    await act(async () => {
      fireEvent.click(yes);
    });

    // The handler is async — file.text() + importAll() resolve in
    // microtasks after the click. waitFor polls until the achievement
    // flag (the last write in handleImportFile) is stamped.
    await waitFor(() =>
      expect(localStorage.getItem("cards-data-imported")).toBe("true"),
    );
    // Recognized keys round-tripped verbatim into localStorage.
    expect(localStorage.getItem("cards-favorites")).toBe(
      '["klondike","freecell"]',
    );
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4}');
    expect(localStorage.getItem("cards-best-times")).toBe('{"freecell":120}');
    // Unknown keys silently skipped — they must not pollute storage.
    expect(localStorage.getItem("not-a-known-key")).toBeNull();
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

  // W728 — clear-all's requireText gate must be EXACT match. Existing
  // coverage (W672 + the success-path test above) verifies confirm-yes
  // starts disabled and becomes enabled when "DELETE" is typed; this test
  // covers the in-between cases — partial, lowercase, and extra-character
  // input — where confirm-yes must stay disabled and clicking it does not
  // wipe data. Catches regressions where the gate gets loosened to a
  // case-insensitive / startsWith / includes check.
  it("clear-all keeps confirm disabled and preserves data on wrong requireText", async () => {
    localStorage.setItem("cards-ratings", '{"klondike":4}');
    localStorage.setItem("cards-best-times", '{"freecell":120}');
    renderPage();
    fireEvent.click(screen.getByTestId("settings-clear"));
    const yes = (await screen.findByTestId("confirm-yes")) as HTMLButtonElement;
    const input = screen.getByTestId("confirm-input") as HTMLInputElement;
    // Partial — must stay disabled.
    fireEvent.change(input, { target: { value: "DEL" } });
    expect(yes.disabled).toBe(true);
    // Wrong case — must stay disabled (exact match, case-sensitive).
    fireEvent.change(input, { target: { value: "delete" } });
    expect(yes.disabled).toBe(true);
    // Trailing whitespace / extra char — must stay disabled.
    fireEvent.change(input, { target: { value: "DELETE " } });
    expect(yes.disabled).toBe(true);
    fireEvent.change(input, { target: { value: "DELETED" } });
    expect(yes.disabled).toBe(true);
    // Clicking the disabled button must be a no-op — data survives.
    await act(async () => {
      fireEvent.click(yes);
    });
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4}');
    expect(localStorage.getItem("cards-best-times")).toBe('{"freecell":120}');
  });
});

// Reset isolation: each per-section "Reset" button (and the inline "Reset
// theme" link) must only clear keys belonging to that section. Unrelated
// keys from other sections + non-pref data (ratings, favorites, stats,
// hidden-games) must survive the click untouched.
describe("SettingsPage reset isolation", () => {
  // Canonical key sets per section, mirrored from SettingsPage.tsx so a
  // future drift between source + tests surfaces immediately.
  const APPEARANCE = [
    "cards-bg-theme",
    "cards-theme-custom",
    "cards-card-back",
    "cards-light-mode",
    "cards-card-font",
  ] as const;
  const AUDIO = [
    "cards-sound-on",
    "cards-sound-enabled",
    "cards-sound-volume",
    "cards-mute-on-hidden",
  ] as const;
  const GAMEPLAY = [
    "cards-animations",
    "cards-auto-move",
    "cards-hint-count",
    "cards-hints-enabled",
    "cards-hint-cooldown",
    "cards-show-undo-count",
  ] as const;
  const UNRELATED = {
    "cards-ratings": '{"klondike":4}',
    "cards-favorites": '["klondike"]',
    "cards-hidden-games": '["spider"]',
    "cards-best-times": '{"freecell":120}',
    "cards-data-imported": "true",
  } as const;

  function seedAllSections(): void {
    // Appearance section (non-default values so the reset is observable).
    // bg-theme uses a non-default id ("forest"); light-mode is stored as
    // "1"/"0" not "true"/"false" — see lightMode.ts.
    localStorage.setItem("cards-bg-theme", "forest");
    localStorage.setItem("cards-theme-custom", '{"bg":"#111","surface":"#222","accent":"#abc"}');
    localStorage.setItem("cards-card-back", "red-weave");
    // applyLightMode primes both the document attribute and the storage
    // key, so the SettingsPage's `useState(() => isLightMode())` initializer
    // sees the seeded value at mount.
    applyLightMode(true);
    localStorage.setItem("cards-card-font", "serif");
    // Audio section.
    localStorage.setItem("cards-sound-on", "false");
    localStorage.setItem("cards-sound-enabled", "false");
    localStorage.setItem("cards-sound-volume", "42");
    localStorage.setItem("cards-mute-on-hidden", "false");
    // Gameplay section.
    localStorage.setItem("cards-animations", "off");
    localStorage.setItem("cards-auto-move", "false");
    localStorage.setItem("cards-hint-count", "7");
    localStorage.setItem("cards-hints-enabled", "false");
    localStorage.setItem("cards-hint-cooldown", "false");
    localStorage.setItem("cards-show-undo-count", "true");
    // Unrelated user data — must survive every section reset.
    for (const [k, v] of Object.entries(UNRELATED)) {
      localStorage.setItem(k, v);
    }
  }

  function expectUnrelatedIntact(): void {
    for (const [k, v] of Object.entries(UNRELATED)) {
      expect(localStorage.getItem(k)).toBe(v);
    }
  }

  beforeEach(() => {
    localStorage.clear();
    // Clear the data-light attribute so light-mode seeds don't leak.
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.light;
    }
  });
  afterEach(() => {
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.light;
    }
  });

  it("Reset Appearance leaves audio + gameplay + user data untouched", () => {
    seedAllSections();
    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-appearance"));
    // Audio keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
    expect(localStorage.getItem("cards-sound-enabled")).toBe("false");
    expect(localStorage.getItem("cards-sound-volume")).toBe("42");
    expect(localStorage.getItem("cards-mute-on-hidden")).toBe("false");
    // Gameplay keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-animations")).toBe("off");
    expect(localStorage.getItem("cards-auto-move")).toBe("false");
    expect(localStorage.getItem("cards-hint-count")).toBe("7");
    expect(localStorage.getItem("cards-hints-enabled")).toBe("false");
    expect(localStorage.getItem("cards-hint-cooldown")).toBe("false");
    expect(localStorage.getItem("cards-show-undo-count")).toBe("true");
    expectUnrelatedIntact();
  });

  it("Reset Audio leaves appearance + gameplay + user data untouched", () => {
    seedAllSections();
    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-audio"));
    // Appearance keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-bg-theme")).toBe("forest");
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
    expect(localStorage.getItem("cards-card-font")).toBe("serif");
    expect(localStorage.getItem("cards-light-mode")).toBe("1");
    // Gameplay keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-animations")).toBe("off");
    expect(localStorage.getItem("cards-auto-move")).toBe("false");
    expect(localStorage.getItem("cards-hint-count")).toBe("7");
    expect(localStorage.getItem("cards-hints-enabled")).toBe("false");
    expect(localStorage.getItem("cards-hint-cooldown")).toBe("false");
    expect(localStorage.getItem("cards-show-undo-count")).toBe("true");
    expectUnrelatedIntact();
  });

  it("Reset Gameplay leaves appearance + audio + user data untouched", () => {
    seedAllSections();
    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-gameplay"));
    // Appearance keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-bg-theme")).toBe("forest");
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
    expect(localStorage.getItem("cards-card-font")).toBe("serif");
    expect(localStorage.getItem("cards-light-mode")).toBe("1");
    // Audio keys remain at the seeded non-default values.
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
    expect(localStorage.getItem("cards-sound-enabled")).toBe("false");
    expect(localStorage.getItem("cards-sound-volume")).toBe("42");
    expect(localStorage.getItem("cards-mute-on-hidden")).toBe("false");
    expectUnrelatedIntact();
  });

  it("Reset Theme link resets only bg-theme + custom-theme, not the rest of Appearance", () => {
    seedAllSections();
    renderPage();
    fireEvent.click(screen.getByTestId("theme-reset"));
    // bg-theme is reset to the default ("midnight"); custom-theme blob is
    // cleared. (applyTheme(DEFAULT_THEME) re-writes the default id, which
    // is the intended post-reset state.)
    expect(localStorage.getItem("cards-bg-theme")).toBe("midnight");
    expect(localStorage.getItem("cards-theme-custom")).toBeNull();
    // Other Appearance keys must remain untouched (card back, font, light).
    expect(localStorage.getItem("cards-card-back")).toBe("red-weave");
    expect(localStorage.getItem("cards-card-font")).toBe("serif");
    expect(localStorage.getItem("cards-light-mode")).toBe("1");
    // Audio + Gameplay + user data also untouched.
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
    expect(localStorage.getItem("cards-animations")).toBe("off");
    expectUnrelatedIntact();
  });

  it("each section's reset only writes keys within its own key set", () => {
    // Snapshot every key in localStorage before + after each click; the
    // *symmetric difference* must be a subset of the section's key list.
    function keySnapshot(): Set<string> {
      const out = new Set<string>();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k !== null) out.add(k);
      }
      return out;
    }
    function diff(a: Set<string>, b: Set<string>): Set<string> {
      const out = new Set<string>();
      for (const k of a) if (!b.has(k)) out.add(k);
      for (const k of b) if (!a.has(k)) out.add(k);
      return out;
    }

    seedAllSections();
    renderPage();

    const beforeAppearance = keySnapshot();
    fireEvent.click(screen.getByTestId("settings-reset-appearance"));
    const afterAppearance = keySnapshot();
    for (const k of diff(beforeAppearance, afterAppearance)) {
      expect(APPEARANCE).toContain(k);
    }

    // Re-seed before the next reset so each section starts dirty.
    seedAllSections();
    const beforeAudio = keySnapshot();
    fireEvent.click(screen.getByTestId("settings-reset-audio"));
    const afterAudio = keySnapshot();
    for (const k of diff(beforeAudio, afterAudio)) {
      expect(AUDIO).toContain(k);
    }

    seedAllSections();
    const beforeGameplay = keySnapshot();
    fireEvent.click(screen.getByTestId("settings-reset-gameplay"));
    const afterGameplay = keySnapshot();
    for (const k of diff(beforeGameplay, afterGameplay)) {
      expect(GAMEPLAY).toContain(k);
    }
  });
});

// Mobile accordion: at viewports <600px the four sections collapse into
// a one-open-at-a-time accordion. The active section is persisted under
// `cards-settings-section` and defaults to "appearance" on first load.
describe("SettingsPage mobile accordion", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    setMatchMedia(false);
  });

  it("exposes a section-toggle button with the documented test id for each section", () => {
    setMatchMedia(false);
    renderPage();
    expect(screen.getByTestId("settings-section-toggle-appearance")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-toggle-audio")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-toggle-gameplay")).toBeInTheDocument();
    expect(screen.getByTestId("settings-section-toggle-data")).toBeInTheDocument();
  });

  it("on mobile, only the appearance section body renders by default", () => {
    setMatchMedia(true);
    renderPage();
    // Appearance body fields are present.
    expect(screen.getByTestId("cardback-gallery")).toBeInTheDocument();
    // Other section fields are NOT mounted while their card is collapsed.
    expect(screen.queryByTestId("sound-toggle")).not.toBeInTheDocument();
    expect(screen.queryByTestId("settings-auto-move")).not.toBeInTheDocument();
    expect(screen.queryByTestId("settings-export")).not.toBeInTheDocument();
  });

  it("on mobile, clicking a different toggle opens that section and closes the previous one", () => {
    setMatchMedia(true);
    renderPage();
    fireEvent.click(screen.getByTestId("settings-section-toggle-audio"));
    expect(screen.getByTestId("sound-toggle")).toBeInTheDocument();
    // Appearance body has unmounted.
    expect(screen.queryByTestId("cardback-gallery")).not.toBeInTheDocument();
    // Switching again leaves only one body open.
    fireEvent.click(screen.getByTestId("settings-section-toggle-gameplay"));
    expect(screen.getByTestId("settings-auto-move")).toBeInTheDocument();
    expect(screen.queryByTestId("sound-toggle")).not.toBeInTheDocument();
  });

  it("persists the last-open section under cards-settings-section", () => {
    setMatchMedia(true);
    renderPage();
    fireEvent.click(screen.getByTestId("settings-section-toggle-data"));
    expect(localStorage.getItem("cards-settings-section")).toBe("data");
  });

  it("hydrates the previously-open section from localStorage on mount", () => {
    localStorage.setItem("cards-settings-section", "gameplay");
    setMatchMedia(true);
    renderPage();
    expect(screen.getByTestId("settings-auto-move")).toBeInTheDocument();
    expect(screen.queryByTestId("cardback-gallery")).not.toBeInTheDocument();
  });

  it("on desktop, every section body remains rendered regardless of the persisted choice", () => {
    localStorage.setItem("cards-settings-section", "data");
    setMatchMedia(false);
    renderPage();
    expect(screen.getByTestId("cardback-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("sound-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("settings-auto-move")).toBeInTheDocument();
    expect(screen.getByTestId("settings-export")).toBeInTheDocument();
  });
});

// W214 — Audio "Test sounds" panel: each preview button should render,
// click should fan out to playSound(), and the buttons must mirror the
// master sound toggle's disabled state so a muted user never hears a
// surprise sample.
describe("SettingsPage Test sounds panel (W214)", () => {
  const TEST_BUTTON_IDS = [
    "settings-test-card-deal",
    "settings-test-card-flip",
    "settings-test-card-place",
    "settings-test-card-shuffle",
    "settings-test-win",
    "settings-test-win-fanfare",
  ] as const;

  beforeEach(() => {
    localStorage.clear();
    vi.mocked(playSound).mockClear();
  });

  it("renders a test-sound button for every preview category", () => {
    renderPage();
    expect(screen.getByTestId("settings-test-sounds")).toBeInTheDocument();
    for (const id of TEST_BUTTON_IDS) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });

  it("clicking settings-test-card-place invokes playSound('card-place')", () => {
    renderPage();
    fireEvent.click(screen.getByTestId("settings-test-card-place"));
    expect(playSound).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith("card-place");
  });

  it("disables every test-sound button when the master sound toggle is off", () => {
    localStorage.setItem("cards-sound-on", "false");
    renderPage();
    for (const id of TEST_BUTTON_IDS) {
      const btn = screen.getByTestId(id) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    }
  });
});

// W614 (W289 + W169): the Data → "Reset favorites only" mini-action must
// clear the `cards-favorites` blob and *only* that blob — the user's
// hidden-games set and star ratings live in sibling localStorage keys
// and must survive untouched. Pinning this isolation prevents a future
// refactor from accidentally fanning out to clearAllRatings /
// clearAllHiddenGames in the same handler.
describe("SettingsPage Reset favorites isolation (W614)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Reset favorites clears only cards-favorites; hidden games + ratings survive", async () => {
    // Seed all three sibling user-data blobs with non-empty values so the
    // post-click assertions are observable (a test that started empty
    // would pass trivially even on a buggy clearKeys(KNOWN_KEYS) regress).
    localStorage.setItem("cards-favorites", '["klondike","spider"]');
    localStorage.setItem("cards-hidden-games", '["freecell"]');
    localStorage.setItem("cards-ratings", '{"klondike":4,"spider":3}');

    renderPage();
    fireEvent.click(screen.getByTestId("settings-reset-favorites"));
    // The confirm dialog (driven by useStandaloneConfirm — same provider
    // shape as ConfirmProvider) must appear and accept a plain Yes.
    const yes = (await screen.findByTestId("confirm-yes")) as HTMLButtonElement;
    // No requireText for this action — confirm-yes is enabled immediately.
    expect(yes.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(yes);
    });

    // Favorites blob is gone (clearAllFavorites does removeItem, not "[]").
    expect(localStorage.getItem("cards-favorites")).toBeNull();
    // Hidden games + ratings are byte-for-byte the seeded values.
    expect(localStorage.getItem("cards-hidden-games")).toBe('["freecell"]');
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4,"spider":3}');
  });
});

// W616 (W289): the Data → "Show hidden games" mini-action must clear the
// `cards-hidden-games` blob so previously-hidden tiles surface again in
// every lobby filter. Other sibling user-data blobs (favorites, ratings)
// must survive untouched, mirroring the W614 favorites isolation contract.
// Unlike clear-all, this action is non-destructive (danger:false) and
// confirm-yes is enabled at once with no requireText gate.
describe("SettingsPage Show hidden games (W616)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Show hidden games clears cards-hidden-games; favorites + ratings survive", async () => {
    localStorage.setItem("cards-hidden-games", '["spider","freecell"]');
    localStorage.setItem("cards-favorites", '["klondike"]');
    localStorage.setItem("cards-ratings", '{"klondike":4}');

    renderPage();
    fireEvent.click(screen.getByTestId("settings-show-hidden"));
    // Confirm dialog driven by useStandaloneConfirm (same shape as
    // ConfirmProvider). No requireText — confirm-yes is enabled at once.
    const yes = (await screen.findByTestId("confirm-yes")) as HTMLButtonElement;
    expect(yes.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(yes);
    });

    // Hidden-games blob is gone (clearAllHiddenGames does removeItem).
    expect(localStorage.getItem("cards-hidden-games")).toBeNull();
    // Sibling user-data blobs are byte-for-byte the seeded values.
    expect(localStorage.getItem("cards-favorites")).toBe('["klondike"]');
    expect(localStorage.getItem("cards-ratings")).toBe('{"klondike":4}');
  });
});

// W679: the Audio → Volume range slider must persist its value to the
// `cards-sound-volume` localStorage key on change AND fan out a same-tab
// `cards:volume-change` CustomEvent (whose `detail` carries the new
// integer 0..100) so sounds.ts can update its module-scope cache without
// waiting for a `storage` event (which doesn't fire in the writing tab).
// The visible "% meta" label adjacent to the field must also reflect the
// new value so the user sees the change immediately.
describe("SettingsPage volume slider (W679)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the new volume to cards-sound-volume and dispatches cards:volume-change", () => {
    const handler = vi.fn();
    window.addEventListener("cards:volume-change", handler as EventListener);
    try {
      renderPage();
      const slider = screen.getByTestId("settings-volume") as HTMLInputElement;
      fireEvent.change(slider, { target: { value: "37" } });
      // Persisted to localStorage on the 0..100 integer scale.
      expect(localStorage.getItem("cards-sound-volume")).toBe("37");
      // Visible "%" meta label tracks the new value.
      expect(screen.getByText("37%")).toBeInTheDocument();
      // Same-tab CustomEvent fired exactly once with detail=37.
      expect(handler).toHaveBeenCalledTimes(1);
      const evt = handler.mock.calls[0][0] as CustomEvent<number>;
      expect(evt.type).toBe("cards:volume-change");
      expect(evt.detail).toBe(37);
    } finally {
      window.removeEventListener("cards:volume-change", handler as EventListener);
    }
  });
});

// W688: the Audio → "Sound effects" master toggle must persist its new
// value to the `cards-sound-on` localStorage key on click. Unlike the
// volume slider (W679) which fans out a `cards:volume-change` CustomEvent,
// the sound on/off toggle relies on the React state + storage path alone
// — sounds.ts re-reads `cards-sound-on` lazily on the next playSound()
// call, so no same-tab broadcast is needed. This test pins the bidirectional
// persistence contract: off → on as well as on → off, since the existing
// "toggles sound preference" test only covers one direction.
describe("SettingsPage sound toggle (W688)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the new value to cards-sound-on across both directions", () => {
    // Seed the muted state so the first click drives off → on. This
    // complements the default-on case covered by the older test.
    localStorage.setItem("cards-sound-on", "false");
    renderPage();
    const toggle = screen.getByTestId("sound-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    // off → on
    fireEvent.click(toggle);
    expect(localStorage.getItem("cards-sound-on")).toBe("true");
    expect(toggle.checked).toBe(true);
    // on → off (round-trip the same control)
    fireEvent.click(toggle);
    expect(localStorage.getItem("cards-sound-on")).toBe("false");
    expect(toggle.checked).toBe(false);
  });
});

// W170 + W493: the Gameplay → "Welcome tutorial → Show again" link must
// clear only the `__welcome__` slot inside the `cards-tutorial-seen`
// SeenMap (preserving any other game-specific tutorial-seen flags) and
// dispatch a `cards:open-welcome-tutorial` window event so the carousel
// host can re-mount the four-step intro.
describe("SettingsPage show-tutorial link (W561)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears the __welcome__ flag and dispatches cards:open-welcome-tutorial", () => {
    // Pre-seed the SeenMap with both __welcome__ (must be cleared) and a
    // real game id (must survive). This pins the "only welcome" contract.
    localStorage.setItem(
      "cards-tutorial-seen",
      JSON.stringify({ __welcome__: true, klondike: true }),
    );
    const handler = vi.fn();
    window.addEventListener("cards:open-welcome-tutorial", handler);
    try {
      renderPage();
      fireEvent.click(screen.getByTestId("settings-show-tutorial"));

      const raw = localStorage.getItem("cards-tutorial-seen");
      expect(raw).not.toBeNull();
      const map = JSON.parse(raw as string) as Record<string, boolean>;
      expect(map.__welcome__).toBeUndefined();
      // Other tutorial-seen flags must be untouched.
      expect(map.klondike).toBe(true);

      expect(handler).toHaveBeenCalledTimes(1);
      const evt = handler.mock.calls[0][0] as Event;
      expect(evt.type).toBe("cards:open-welcome-tutorial");
    } finally {
      window.removeEventListener("cards:open-welcome-tutorial", handler);
    }
  });
});

// W849 — the `settings-show-tutorial` button replays the welcome carousel
// only; it must NOT arm the lobby Featured-strip coachmark. That's a
// separate concern owned by `settings-show-coachmarks` (W843). W561 pins
// the welcome-flag clear + event dispatch but doesn't assert what the
// button leaves alone — a regression that copy-pasted `setCoachmarkPending()`
// into the show-tutorial handler would slip through W561 unnoticed because
// neither side of the existing `__welcome__` / event assertions cares about
// `cards-onboard-coachmark`. Pre-seeding the coachmark key as "seen" and
// asserting it survives the click pins the negative contract.
describe("SettingsPage show-tutorial button leaves coachmark untouched (W849)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not write cards-onboard-coachmark when replaying the welcome tutorial", () => {
    // Pre-seed the coachmark key with the post-dismiss "seen" sentinel.
    // If the show-tutorial handler ever started arming the coachmark
    // (by calling setCoachmarkPending()), this would flip to "pending".
    localStorage.setItem("cards-onboard-coachmark", "seen");
    renderPage();
    fireEvent.click(screen.getByTestId("settings-show-tutorial"));
    // Coachmark key must be exactly what we put there — show-tutorial
    // owns only the welcome-tutorial flag, not the coachmark state.
    expect(localStorage.getItem("cards-onboard-coachmark")).toBe("seen");
  });
});

// W746: Settings UI side of the card-font picker. Existing coverage pins
// the card-back gallery (W743) and the theme picker (W668), but the Card
// font radiogroup (`card-font-serif` / `card-font-modern`) had no visible-
// state assertions until now. This test pins the contract: clicking the
// non-default tile (Serif) writes "serif" to `cards-card-font` AND moves
// aria-checked / is-selected to the clicked tile, with the previously-
// selected Modern tile losing both markers. Catches regressions where the
// onClick disconnects from setCardFont or the selected-class logic stops
// tracking the active option.
describe("SettingsPage card-font picker (W746)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking the serif tile flips aria-checked and persists cards-card-font", () => {
    renderPage();
    const modernTile = screen.getByTestId("card-font-modern");
    const serifTile = screen.getByTestId("card-font-serif");
    // Default render — modern is the active tile, serif is not.
    expect(modernTile.getAttribute("aria-checked")).toBe("true");
    expect(serifTile.getAttribute("aria-checked")).toBe("false");
    expect(modernTile.className).toContain("is-selected");
    expect(serifTile.className).not.toContain("is-selected");
    fireEvent.click(serifTile);
    // localStorage was rewritten and selection moved to the clicked tile.
    expect(localStorage.getItem("cards-card-font")).toBe("serif");
    expect(serifTile.getAttribute("aria-checked")).toBe("true");
    expect(modernTile.getAttribute("aria-checked")).toBe("false");
    expect(serifTile.className).toContain("is-selected");
    expect(modernTile.className).not.toContain("is-selected");
  });
});

// W751: Settings UI side of the Gameplay → Animations picker. The three
// pill tiles (`animations-full` / `animations-reduced` / `animations-off`)
// drive the global `data-animations` attribute on <html> and persist the
// choice to `cards-animations`. Sibling pickers W743 (card-back gallery)
// and W746 (card-font) pin their own aria-checked / is-selected contracts;
// this completes the Settings picker triad. Catches regressions where the
// onClick disconnects from setAnimations or the selected-class logic stops
// tracking the active option.
describe("SettingsPage animations picker (W751)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clicking the reduced tile flips aria-checked and persists cards-animations", () => {
    renderPage();
    const fullTile = screen.getByTestId("animations-full");
    const reducedTile = screen.getByTestId("animations-reduced");
    const offTile = screen.getByTestId("animations-off");
    // Default render — full is the active tile, reduced + off are not.
    expect(fullTile.getAttribute("aria-checked")).toBe("true");
    expect(reducedTile.getAttribute("aria-checked")).toBe("false");
    expect(offTile.getAttribute("aria-checked")).toBe("false");
    expect(fullTile.className).toContain("is-selected");
    expect(reducedTile.className).not.toContain("is-selected");
    fireEvent.click(reducedTile);
    // localStorage was rewritten and selection moved to the clicked tile.
    expect(localStorage.getItem("cards-animations")).toBe("reduced");
    expect(reducedTile.getAttribute("aria-checked")).toBe("true");
    expect(fullTile.getAttribute("aria-checked")).toBe("false");
    expect(offTile.getAttribute("aria-checked")).toBe("false");
    expect(reducedTile.className).toContain("is-selected");
    expect(fullTile.className).not.toContain("is-selected");
  });
});

// W702: Settings UI side of the hint-cooldown contract. PlayPage tests
// W692 / W698 cover the runtime side (the cooldown actually throttles,
// or doesn't, based on the stored flag). This test pins the SettingsPage
// toggle: the default is "on" (true), clicking flips the localStorage
// value to "false", and clicking again round-trips back to "true". The
// `cards-hint-cooldown` key is the single source of truth — keeping
// these in lock-step prevents UI/runtime drift.
describe("SettingsPage hint-cooldown toggle (W702)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists cards-hint-cooldown across both directions", () => {
    renderPage();
    const toggle = screen.getByTestId(
      "settings-hint-cooldown",
    ) as HTMLInputElement;
    // Default is on (true) — readHintCooldown() returns true when unset.
    expect(toggle.checked).toBe(true);
    // The persistence effect writes the hydrated default on mount.
    expect(localStorage.getItem("cards-hint-cooldown")).toBe("true");
    // on → off
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-hint-cooldown")).toBe("false");
    // off → on (round-trip the same control)
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-hint-cooldown")).toBe("true");
  });

  // W802 — focused coverage of the Data > Use mock friends toggle. The
  // existing tests cover sound, auto-move, hints, hint-cooldown, and the
  // accordion / search filter, but nothing exercises the mock-friends
  // devmode switch. The toggle defaults to off (isMockFriendsEnabled()
  // returns false when unset) and writes `cards-leaderboard-friends`. We
  // verify the default-off render, a click flipping the checkbox + the
  // visible "On"/"Off" label while persisting "true", and a return click
  // that round-trips back to "false". Catches regressions where the
  // onChange disconnects from setMockFriends or the persistence useEffect
  // stops mirroring state through setMockFriendsEnabled().
  it("toggles mock-friends preference, updates the visible label, and persists in both directions", () => {
    renderPage();
    const toggle = screen.getByTestId(
      "settings-mock-friends",
    ) as HTMLInputElement;
    // Default: mock-friends is off when nothing is in storage.
    expect(toggle.checked).toBe(false);
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // off → on — checkbox flips, label re-renders, storage rewrites.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-leaderboard-friends")).toBe("true");
    expect(toggle.closest("label")?.textContent).toContain("On");
    // on → off — full round-trip.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-leaderboard-friends")).toBe("false");
    expect(toggle.closest("label")?.textContent).toContain("Off");
  });

  // W830 — focused coverage of the Data > Use mock leaderboard toggle.
  // Sibling to the mock-friends test (W802); the mock-leaderboard switch
  // controls whether the Top Players tab synthesises 5 simulated players
  // and is wired to localStorage key `cards-leaderboard-mock` via
  // isMockLeaderboardEnabled() / setMockLeaderboardEnabled() in
  // platform/leaderboardClient.ts. Defaults to off when unset. We verify
  // the default-off render, a click flipping the checkbox + the visible
  // "On"/"Off" label while persisting "true", and a return click that
  // round-trips back to "false". Catches regressions where the onChange
  // disconnects from setMockLeaderboard or the persistence useEffect
  // stops mirroring state through setMockLeaderboardEnabled().
  it("toggles mock-leaderboard preference, updates the visible label, and persists in both directions", () => {
    renderPage();
    const toggle = screen.getByTestId(
      "settings-mock-leaderboard",
    ) as HTMLInputElement;
    // Default: mock-leaderboard is off when nothing is in storage.
    expect(toggle.checked).toBe(false);
    expect(toggle.closest("label")?.textContent).toContain("Off");
    // off → on — checkbox flips, label re-renders, storage rewrites.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-leaderboard-mock")).toBe("true");
    expect(toggle.closest("label")?.textContent).toContain("On");
    // on → off — full round-trip.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-leaderboard-mock")).toBe("false");
    expect(toggle.closest("label")?.textContent).toContain("Off");
  });

  // W835 — focused coverage of the Settings page search-filter input. The
  // header exposes a `<input type="search">` with testid
  // settings-search-input that drives `matchesQuery(label)` on every
  // Appearance-section field. Non-matching `.settings-field` rows flip
  // their `hidden` attribute, so the underlying inputs (theme picker,
  // light-mode toggle, card-back gallery, card-font picker) are removed
  // from accessible/visible state. Clearing the query rehydrates every
  // row. Nothing else exercises the search filter today — every other
  // SettingsPage test bypasses the input, so a regression that wires the
  // onChange to the wrong setter (or drops the `hidden` attribute on
  // matchesQuery() === false) would slip through silently.
  it("filters Appearance fields by query and rehydrates them when cleared", () => {
    renderPage();
    const search = screen.getByTestId(
      "settings-search-input",
    ) as HTMLInputElement;
    // Locate the four Appearance-section field rows by walking up from a
    // child testid that's stable. Each row owns the `hidden` attribute
    // toggled by matchesQuery().
    const themeRow = screen
      .getByTestId("theme-reset")
      .closest(".settings-field") as HTMLElement;
    const lightRow = screen
      .getByTestId("settings-light-mode")
      .closest(".settings-field") as HTMLElement;
    const cardBackRow = screen
      .getByTestId("cardback-gallery")
      .closest(".settings-field") as HTMLElement;
    const cardFontRow = screen
      .getByTestId("card-font-modern")
      .closest(".settings-field") as HTMLElement;
    // Default: empty query → every Appearance row visible (no `hidden`).
    expect(themeRow.hidden).toBe(false);
    expect(lightRow.hidden).toBe(false);
    expect(cardBackRow.hidden).toBe(false);
    expect(cardFontRow.hidden).toBe(false);
    // Type "card back" — only the Card back row should remain visible;
    // Background theme / Light mode / Card font rows hide.
    fireEvent.change(search, { target: { value: "card back" } });
    expect(search.value).toBe("card back");
    expect(cardBackRow.hidden).toBe(false);
    expect(themeRow.hidden).toBe(true);
    expect(lightRow.hidden).toBe(true);
    expect(cardFontRow.hidden).toBe(true);
    // Clear the query → every Appearance row rehydrates.
    fireEvent.change(search, { target: { value: "" } });
    expect(search.value).toBe("");
    expect(themeRow.hidden).toBe(false);
    expect(lightRow.hidden).toBe(false);
    expect(cardBackRow.hidden).toBe(false);
    expect(cardFontRow.hidden).toBe(false);
  });
});

// W843 — focused coverage of the "Show coachmarks" button in the Gameplay
// section. The button arms `setCoachmarkPending()` (writes
// cards-onboard-coachmark = "pending"), then calls `resetWelcomeTutorial()`
// to clear the `__welcome__` flag, and dispatches the
// `cards:open-welcome-tutorial` event so the carousel re-opens. Existing
// W561 coverage pins the show-tutorial button, but `settings-show-coachmarks`
// is a *separate* control that additionally writes the coachmark state key.
// A regression that disconnected its onClick from setCoachmarkPending would
// silently slip through — nothing else exercises this single-click contract.
describe("SettingsPage show-coachmarks button (W843)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("arms the coachmark, clears __welcome__, and dispatches the open-welcome event", () => {
    // Pre-seed: the welcome flag must be cleared, an unrelated tutorial-seen
    // entry must survive, and the coachmark key starts unset.
    localStorage.setItem(
      "cards-tutorial-seen",
      JSON.stringify({ __welcome__: true, klondike: true }),
    );
    expect(localStorage.getItem("cards-onboard-coachmark")).toBeNull();
    const handler = vi.fn();
    window.addEventListener("cards:open-welcome-tutorial", handler);
    try {
      renderPage();
      fireEvent.click(screen.getByTestId("settings-show-coachmarks"));

      // Coachmark is armed for the next lobby visit.
      expect(localStorage.getItem("cards-onboard-coachmark")).toBe("pending");
      // Welcome flag cleared, sibling game flag preserved.
      const map = JSON.parse(
        localStorage.getItem("cards-tutorial-seen") as string,
      ) as Record<string, boolean>;
      expect(map.__welcome__).toBeUndefined();
      expect(map.klondike).toBe(true);
      // Carousel re-open event was dispatched exactly once.
      expect(handler).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("cards:open-welcome-tutorial", handler);
    }
  });
});

// W855 — `settings-show-coachmarks` must overwrite a *terminal* coachmark
// state ("done", written when the user has already dismissed the lobby
// hint) back to "pending". W843 only proves the unset → pending arc; a
// regression that gated the write on `getCoachmarkState() !== "done"`
// (e.g. a guard "don't re-arm if already shown") would slip through W843
// because that test starts from a null key. The whole point of the
// "Show again" affordance is to defeat the sticky terminal state, so we
// pin the override explicitly.
describe("SettingsPage show-coachmarks overrides terminal state (W855)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("forces coachmark from done back to pending when user re-arms it", () => {
    // Simulate a user who has already dismissed the coachmark — the key
    // is sticky-"done" until something explicitly re-arms it.
    localStorage.setItem("cards-onboard-coachmark", "done");
    renderPage();
    fireEvent.click(screen.getByTestId("settings-show-coachmarks"));
    // The terminal "done" sentinel must be overwritten, not preserved.
    expect(localStorage.getItem("cards-onboard-coachmark")).toBe("pending");
  });
});

// W864 — focused coverage of the Gameplay → "Hints per game" range slider.
// Other tests only verify the storage key gets cleared on per-section reset
// or pre-seed it as a fixture; nothing exercises the slider's interactive
// onChange path. This test verifies that dragging the slider to a new
// integer value (a) persists `cards-hint-count` on the 0..10 integer
// scale and (b) updates the visible meta count next to the label so the
// user sees their new selection. Catches regressions where the onChange
// disconnects from setHintCount or the persistence useEffect stops
// mirroring state to localStorage.
describe("SettingsPage hint-count slider (W864)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the new value to cards-hint-count and updates the visible meta count", () => {
    renderPage();
    const slider = screen.getByTestId("settings-hint-count") as HTMLInputElement;
    // Default is 3 — confirm the visible meta tracks initial state so the
    // post-change assertion can't pass on a stale render.
    expect(slider.value).toBe("3");
    fireEvent.change(slider, { target: { value: "7" } });
    expect(slider.value).toBe("7");
    expect(localStorage.getItem("cards-hint-count")).toBe("7");
    // The "<n>" meta span next to the label re-renders with the new count.
    expect(screen.getByText("7", { selector: ".settings-meta" })).toBeInTheDocument();
  });
});
