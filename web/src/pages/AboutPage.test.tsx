import { beforeAll, describe, expect, it, vi } from "vitest";
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

  it("renders categories, themes, and families stat tiles with expected counts", async () => {
    const { FAMILIES } = await import("../games/families.js");
    const { THEMES } = await import("../platform/themes.js");
    renderPage();

    const categories = screen.getByTestId("about-stat-categories");
    expect(categories).toBeInTheDocument();
    expect(categories).toHaveTextContent("5");

    const themes = screen.getByTestId("about-stat-themes");
    expect(themes).toBeInTheDocument();
    expect(THEMES.length).toBeGreaterThanOrEqual(10);
    expect(themes).toHaveTextContent(THEMES.length.toLocaleString());

    const families = screen.getByTestId("about-stat-families");
    expect(families).toBeInTheDocument();
    expect(FAMILIES.length).toBeGreaterThanOrEqual(100);
    expect(families).toHaveTextContent(FAMILIES.length.toLocaleString());
  });

  it("renders Stack section chips for React, TypeScript, Vite, Vitest, etc.", () => {
    renderPage();
    const heading = screen.getByRole("heading", { name: "Stack" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    const stack = section as HTMLElement;
    const chips = stack.querySelectorAll(".about-chip");
    const chipTexts = Array.from(chips).map((c) => c.textContent ?? "");
    for (const expected of [
      "React",
      "TypeScript",
      "Vite",
      "Vitest",
      "Zustand",
      "react-router",
      "PWA",
    ]) {
      expect(chipTexts).toContain(expected);
    }
    // Verify by querying for "React" text within the stack section.
    expect(stack.textContent).toContain("React");
  });

  it(
    "shows 'Build info unavailable' fallback when commits array is empty",
    async () => {
      // Re-import AboutPage with an empty __BUILD_LATEST_COMMITS__ so the
      // module-scope LATEST_COMMITS captures [] and the fallback branch
      // renders. resetModules forces the AboutPage module (and its deps,
      // including the heavy game registry) to be re-evaluated, which is
      // why this test bumps the timeout.
      vi.resetModules();
      (globalThis as unknown as Record<string, unknown>).__BUILD_LATEST_COMMITS__ =
        [] as readonly string[];
      const mod = await import("./AboutPage.js");
      const EmptyAboutPage = mod.default;

      render(
        <MemoryRouter>
          <EmptyAboutPage />
        </MemoryRouter>,
      );

      const section = screen.getByTestId("about-whatsnew");
      expect(section).toHaveTextContent("Build info unavailable.");
      expect(screen.queryByTestId("about-whatsnew-0")).toBeNull();

      // Restore fixture commits for any subsequent imports in this file.
      (globalThis as unknown as Record<string, unknown>).__BUILD_LATEST_COMMITS__ =
        FIXTURE_COMMITS;
    },
    120_000,
  );
});
