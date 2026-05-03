/**
 * Unit tests for the post-win banner's Print and Save-image buttons (W557).
 *
 * Two observable behaviors of the share/print row that renders inside the
 * win banner:
 *   1. `play-print-btn` calls `window.print()` so the page-level
 *      `@media print` rules in PlayPage.css can produce a clean
 *      scoresheet.
 *   2. `play-share-image-btn` builds an SVG share card and downloads it
 *      via `URL.createObjectURL`, passing a `Blob` whose first chunk is
 *      the SVG document the user expects to receive.
 *
 * Strategy mirrors the existing PlayPage.rating test: a hoisted fixture
 * plugin with a reducer that flips a `won` flag in response to a `WIN`
 * action, plus an `isTerminal` that reports a positive score once the
 * flag is set. Clicking the fixture's `fixture-win` button drives the
 * page from `setup` -> `playing` -> `ended` so the win banner (and the
 * share row inside it) renders deterministically.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Hoisted fixture plugin. Minimal reducer/isTerminal pair that flips into
// a winning terminal state on a single dispatched action — enough to
// drive PlayPage to `phase === "ended"` with `finalScore > 0`, which
// reveals the share row containing both buttons under test.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-fixture";
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "Share Fixture",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "Print + share-image test fixture.",
    settings: {} as Record<string, never>,
    initialState: (): State => ({ won: false }),
    reducer: (s: State, action: { type: string }): State =>
      action?.type === "WIN" ? { won: true } : s,
    isTerminal: (s: State) => (s.won ? { score: 1 } : null),
    component: ({ dispatch }: { dispatch: (a: { type: string }) => void }) => (
      <div>
        <button
          type="button"
          data-testid="fixture-win"
          onClick={() => dispatch({ type: "WIN" })}
        >
          win
        </button>
      </div>
    ),
  };
  return { TEST_GAME_ID, fixturePlugin };
});

// PlayPage looks the plugin up via the games registry — substitute the
// fixture so we don't drag the real game catalogue into the test.
vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs that jsdom doesn't implement; stubbing
// it keeps the win-banner render fast and side-effect-free.
vi.mock("../platform/Confetti.js", () => ({
  default: () => null,
  Confetti: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

/**
 * Mounts PlayPage at the fixture game, advances past the setup screen,
 * then dispatches the win action so the page reaches `phase === "ended"`
 * with a positive `finalScore` — i.e. the terminal state where the
 * win-banner share row (with the Print + Save-image buttons) is visible.
 */
async function mountAtWinBanner(): Promise<void> {
  const { default: PlayPage } = await import("./PlayPage.js");
  render(
    <MemoryRouter initialEntries={[`/play/${hoisted.TEST_GAME_ID}?seed=1`]}>
      <Routes>
        <Route path="/play/:gameId" element={<PlayPage />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByTestId("start-game"));
  act(() => {
    fireEvent.click(screen.getByTestId("fixture-win"));
  });
}

describe("PlayPage win-banner share/print buttons (W557)", () => {
  it("play-print-btn triggers window.print() so the print stylesheet runs", async () => {
    // jsdom doesn't implement window.print — assign a spy directly so
    // the printScoresheet callback's `typeof window.print === "function"`
    // guard passes and the call is observable.
    const printSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).print = printSpy;

    await mountAtWinBanner();

    const printBtn = screen.getByTestId("play-print-btn");
    expect(printBtn).toBeTruthy();

    act(() => {
      fireEvent.click(printBtn);
    });

    // The printScoresheet handler invokes window.print() exactly once;
    // the @media print rules in PlayPage.css then take over to produce
    // the clean scoresheet layout.
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("play-share-image-btn calls URL.createObjectURL with a Blob containing SVG", async () => {
    // jsdom doesn't implement URL.createObjectURL — capture the Blob
    // argument so we can assert the share-card SVG payload reaches the
    // download path. Also stub revokeObjectURL (downloadSvg defers it
    // via setTimeout(0)) and the synthetic anchor click so jsdom doesn't
    // try to navigate to the blob URL.
    let capturedBlob: Blob | null = null;
    const createObj = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-url";
    });
    const revokeObj = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = createObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = revokeObj;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await mountAtWinBanner();

    const shareBtn = screen.getByTestId("play-share-image-btn");
    expect(shareBtn).toBeTruthy();

    act(() => {
      fireEvent.click(shareBtn);
    });

    // downloadSvg should have created a Blob URL exactly once and clicked
    // the synthetic anchor that triggers the download.
    expect(createObj).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // Inspect the Blob: it should be tagged as image/svg+xml and its
    // text payload should be the share-card SVG document built by
    // buildShareCardSvg. jsdom's Blob doesn't expose `.text()`, so we
    // read it via FileReader.readAsText, which it does implement.
    expect(capturedBlob).not.toBeNull();
    const blob = capturedBlob as unknown as Blob;
    expect(blob.type).toContain("image/svg+xml");
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    // The share-card output begins with a standard XML prolog followed
    // by the `<svg>` root — match both so a future drop of either piece
    // is caught here rather than as a downstream rendering surprise.
    expect(text).toContain("<?xml");
    expect(text).toContain("<svg");
    expect(text).toContain("Share Fixture");

    clickSpy.mockRestore();
  });
});

// Reference React so the file is unambiguously a JSX module under
// strict tsconfigs that don't auto-import the runtime in tests.
void React;
