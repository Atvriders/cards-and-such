import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
