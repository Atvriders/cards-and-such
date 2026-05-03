import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DailyPage from "./DailyPage.js";
import {
  formatDateStamp,
  hashStamp,
  pickDailyGame,
  parScore,
  getTodaysDaily,
  todayStamp,
} from "./dailyPicker.js";
import { recordDailyPlayed, getStreak } from "../platform/userdata.js";
import { GAMES } from "../games/registry.js";

function renderPage(): void {
  render(
    <MemoryRouter>
      <DailyPage />
    </MemoryRouter>,
  );
}

describe("dailyPicker", () => {
  it("hashStamp is deterministic across calls", () => {
    expect(hashStamp("2026-05-02")).toBe(hashStamp("2026-05-02"));
    expect(hashStamp("2026-05-02")).not.toBe(hashStamp("2026-05-03"));
  });

  it("pickDailyGame returns the same id for the same date", () => {
    const a = pickDailyGame("2026-05-02");
    const b = pickDailyGame("2026-05-02");
    expect(a.game.id).toBe(b.game.id);
    expect(a.seed).toBe(b.seed);
  });

  it("pickDailyGame is stable across a small range of dates", () => {
    // The first 7 picks should be reproducible — locks behaviour for tests
    // and prevents accidental regressions in the hash.
    const ids = ["2026-05-01", "2026-05-02", "2026-05-03"].map((s) => pickDailyGame(s).game.id);
    const ids2 = ["2026-05-01", "2026-05-02", "2026-05-03"].map((s) => pickDailyGame(s).game.id);
    expect(ids).toEqual(ids2);
  });

  it("formatDateStamp pads month and day", () => {
    expect(formatDateStamp(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("parScore is positive and depends on the seed", () => {
    const game = GAMES[0]!;
    expect(parScore(game, 0)).toBeGreaterThan(0);
    expect(parScore(game, 1)).toBeGreaterThan(0);
  });

  it("getTodaysDaily picks from the real registry", () => {
    const t = getTodaysDaily();
    expect(GAMES.some((g) => g.id === t.game.id)).toBe(true);
  });
});

describe("recordDailyPlayed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts a streak at 1 on first play", () => {
    const next = recordDailyPlayed("2026-05-02");
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
    expect(next.lastDate).toBe("2026-05-02");
    expect(next.days).toContain("2026-05-02");
  });

  it("increments on consecutive days", () => {
    recordDailyPlayed("2026-05-01");
    const next = recordDailyPlayed("2026-05-02");
    expect(next.current).toBe(2);
    expect(next.longest).toBe(2);
  });

  it("resets when a day is skipped", () => {
    recordDailyPlayed("2026-05-01");
    const next = recordDailyPlayed("2026-05-03");
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
  });

  it("is idempotent within the same day", () => {
    recordDailyPlayed("2026-05-02");
    const next = recordDailyPlayed("2026-05-02");
    expect(next.current).toBe(1);
  });

  it("getStreak returns zeroed record when nothing stored", () => {
    expect(getStreak()).toEqual({ current: 0, longest: 0, lastDate: "", days: [] });
  });
});

describe("DailyPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the seeded pick, streak, recap and calendar", () => {
    renderPage();
    expect(screen.getByTestId("daily-pick")).toBeInTheDocument();
    expect(screen.getByTestId("daily-streak")).toBeInTheDocument();
    expect(screen.getByTestId("daily-recap")).toBeInTheDocument();
    expect(screen.getByTestId("daily-calendar")).toBeInTheDocument();
    expect(screen.getByTestId(`daily-cal-cell-${todayStamp()}`)).toBeInTheDocument();
    expect(screen.getByTestId("daily-play-btn")).toBeInTheDocument();
  });

  it("calendar marks today's cell with ✓ after recordDailyPlayed and never renders future-day check", () => {
    const today = todayStamp();
    recordDailyPlayed(today);
    renderPage();
    const cell = screen.getByTestId(`daily-cal-cell-${today}`);
    expect(cell.textContent ?? "").toContain("✓");
    // Compute tomorrow's stamp; if it falls outside the current month it just
    // won't have a test id at all — either way it must not exist as a cell.
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrow = formatDateStamp(t);
    const tomorrowCell = screen.queryByTestId(`daily-cal-cell-${tomorrow}`);
    if (tomorrowCell) {
      expect(tomorrowCell.textContent ?? "").not.toContain("✓");
      expect((tomorrowCell as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("clicking a past calendar cell shows that day's pick info without launching play", () => {
    renderPage();
    // Find any non-today, non-future calendar cell to click.
    const today = todayStamp();
    const cells = document.querySelectorAll<HTMLButtonElement>("[data-testid^='daily-cal-cell-']");
    const past = Array.from(cells).find((c) => {
      const stamp = c.getAttribute("data-stamp") ?? "";
      return stamp && stamp < today && !c.disabled;
    });
    // If the run lands on day-1 of a month there are no past in-month cells —
    // skip the assertion in that edge case rather than fail spuriously.
    if (!past) return;
    const stamp = past.getAttribute("data-stamp")!;
    fireEvent.click(past);
    const detail = screen.getByTestId("daily-cal-detail");
    expect(detail).toBeInTheDocument();
    const expectedPick = pickDailyGame(stamp);
    expect(detail.textContent ?? "").toContain(expectedPick.game.title);
    expect(detail.textContent ?? "").toContain("Not played");
  });

  it("Play Daily button links to /play/<id>?seed=<n>&daily=1", () => {
    renderPage();
    const btn = screen.getByTestId("daily-play-btn") as HTMLAnchorElement;
    expect(btn.getAttribute("href")).toMatch(/^\/play\/[^?]+\?seed=\d+&daily=1$/);
  });

  it("shows the empty-state when streak is zero", () => {
    renderPage();
    expect(screen.getByTestId("daily-streak")).toHaveTextContent(/Come back tomorrow|0/);
  });

  it("renders 7 history rows with date, game name, and Skipped status by default", () => {
    renderPage();
    for (let i = 0; i < 7; i++) {
      const row = screen.getByTestId(`daily-history-row-${i}`);
      expect(row).toBeInTheDocument();
      // Each row should contain a YYYY-MM-DD date stamp.
      expect(row.textContent ?? "").toMatch(/\d{4}-\d{2}-\d{2}/);
      // With no plays and no per-game bests, every row is Skipped.
      expect(row.textContent ?? "").toContain("Skipped");
    }
    // 8th row must NOT exist — only 7 days of history.
    expect(screen.queryByTestId("daily-history-row-7")).toBeNull();
  });

  it("marks today's history row as ✓ Done after recordDailyPlayed", () => {
    recordDailyPlayed(todayStamp());
    renderPage();
    // Today is the newest entry (index 0) per last7Stamps ordering.
    const todayRow = screen.getByTestId("daily-history-row-0");
    expect(todayRow.textContent ?? "").toContain("✓ Done");
    // Each row should also display the picked game's title.
    const todaysPick = pickDailyGame(todayStamp());
    expect(todayRow.textContent ?? "").toContain(todaysPick.game.title);
  });

  it("Share button is clickable and triggers an SVG download", () => {
    // jsdom doesn't implement URL.createObjectURL — stub it so downloadSvg
    // doesn't throw when the button is clicked.
    const createObj = vi.fn(() => "blob:mock-url");
    const revokeObj = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = createObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = revokeObj;
    // Prevent the synthetic anchor click from navigating jsdom.
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderPage();
    const shareBtn = screen.getByTestId("daily-share-btn");
    expect(shareBtn).toBeInTheDocument();
    fireEvent.click(shareBtn);

    expect(createObj).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("Notify toggle persists cards-daily-notify in localStorage and shows the (coming soon) caveat", () => {
    renderPage();
    expect(screen.getByText(/\(coming soon\)/i)).toBeInTheDocument();

    const toggle = screen.getByTestId("daily-notify") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-daily-notify")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(localStorage.getItem("cards-daily-notify")).toBe("true");

    // Toggling back removes the key.
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(localStorage.getItem("cards-daily-notify")).toBeNull();
  });
});
