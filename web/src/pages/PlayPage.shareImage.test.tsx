/**
 * W192 — `play-share-image-btn` end-to-end download path.
 *
 * Drives PlayPage to a terminal-win via a hoisted fixture plugin (same
 * recipe as PlayPage.share/rating), clicks the win-banner Save-image
 * button, and asserts that a Blob containing a `<svg` document was
 * handed to `URL.createObjectURL`. Narrower than the W557 share-row
 * test: this one focuses purely on the SVG payload reaching the
 * download path so a regression in `downloadSvg` / `buildShareCardSvg`
 * wiring is caught even if the broader print + share suite is skipped.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

// Hoisted fixture plugin reaching a terminal-win on a single dispatch.
const hoisted = vi.hoisted(() => {
  const TEST_GAME_ID = "share-image-w192";
  type State = { won: boolean };
  const fixturePlugin = {
    id: TEST_GAME_ID,
    title: "W192 Share Game",
    category: "cards" as const,
    players: { min: 1, max: 1, multiplayer: false },
    description: "W192 share-image test fixture.",
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

vi.mock("../games/registry.js", () => ({
  GAMES: [hoisted.fixturePlugin],
}));

// Confetti pulls in canvas APIs jsdom doesn't implement.
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

describe("PlayPage play-share-image-btn (W192)", () => {
  it("terminal-win → click downloads a Blob whose payload contains `<svg`", async () => {
    // jsdom doesn't implement URL.createObjectURL; capture the Blob so
    // we can assert the SVG payload reaches the download path.
    let capturedBlob: Blob | null = null;
    const createObj = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:w192-mock";
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = createObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = vi.fn();
    // Anchor click would otherwise try to navigate to the blob URL.
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

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

    const shareBtn = screen.getByTestId("play-share-image-btn");
    act(() => {
      fireEvent.click(shareBtn);
    });

    expect(createObj).toHaveBeenCalledTimes(1);
    expect(capturedBlob).not.toBeNull();
    const blob = capturedBlob as unknown as Blob;
    // Read the Blob's text via FileReader (jsdom Blob lacks .text()).
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(text).toContain("<svg");

    clickSpy.mockRestore();
  });
});

void React;
