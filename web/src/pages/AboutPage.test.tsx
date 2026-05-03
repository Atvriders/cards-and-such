import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import type { ComponentType } from "react";

// vite.config.ts injects __BUILD_LATEST_COMMITS__ via `define`; vitest does
// not, so AboutPage's module-scope const would otherwise default to []. We
// seed the global before the AboutPage module is evaluated and import it
// dynamically so the constant captures the fixture array.
const FIXTURE_COMMITS = [
  "abc1234 feat: add about page tests",
  "def5678 fix: registry filter",
];

let AboutPage: ComponentType;

beforeAll(async () => {
  (globalThis as unknown as Record<string, unknown>).__BUILD_LATEST_COMMITS__ =
    FIXTURE_COMMITS;
  const mod = await import("./AboutPage.js");
  AboutPage = mod.default;
});

function renderPage(): void {
  render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe("AboutPage", () => {
  it("renders without crashing", () => {
    renderPage();
    expect(screen.getByTestId("about-page")).toBeInTheDocument();
  });

  it("shows the live game count from the registry", () => {
    renderPage();
    const liveCount = GAMES.filter((g) => g != null).length;
    expect(liveCount).toBeGreaterThan(0);
    const formatted = liveCount.toLocaleString();
    const stat = screen.getByTestId("about-stat-games");
    expect(stat).toHaveTextContent(formatted);
  });

  it("renders 'What's new' with build commits", () => {
    renderPage();
    const section = screen.getByTestId("about-whatsnew");
    expect(section).toHaveTextContent(/What.s new/);
    expect(screen.getByTestId("about-whatsnew-0")).toHaveTextContent("abc1234");
    expect(screen.getByTestId("about-whatsnew-0")).toHaveTextContent(
      "feat: add about page tests",
    );
    expect(screen.getByTestId("about-whatsnew-1")).toHaveTextContent("def5678");
  });

  it("shows the 'Hint coverage: 100%' line", () => {
    renderPage();
    const hint = screen.getByTestId("about-hint-coverage");
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveTextContent(/Hint coverage:\s*100%/);
  });
});
