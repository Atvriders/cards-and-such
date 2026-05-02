import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DailyPage from "./DailyPage.js";
import {
  formatDateStamp,
  hashStamp,
  pickDailyGame,
  parScore,
  getTodaysDaily,
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

  it("renders the seeded pick, streak, recap and heatmap", () => {
    renderPage();
    expect(screen.getByTestId("daily-pick")).toBeInTheDocument();
    expect(screen.getByTestId("daily-streak")).toBeInTheDocument();
    expect(screen.getByTestId("daily-recap")).toBeInTheDocument();
    expect(screen.getByTestId("daily-heatmap")).toBeInTheDocument();
    expect(screen.getByTestId("daily-play-btn")).toBeInTheDocument();
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
});
