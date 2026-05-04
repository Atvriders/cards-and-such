import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1420 — the lobby hero header renders two purely decorative blurred
 * background orbs as the first two children of `<header class="lobby-hero">`:
 *   <div class="lobby-hero-orb lobby-hero-orb--a" aria-hidden="true" />
 *   <div class="lobby-hero-orb lobby-hero-orb--b" aria-hidden="true" />
 * They provide the soft glow behind the eyebrow + title and must stay
 * out of the accessibility tree — the hero's accessible content is the
 * "Live Catalog" eyebrow, the h1, the subheading, and the catalog stats.
 *
 * Why this needs its own pin:
 *  - W1223 (LobbyHeroPulse) covers the small `.lobby-hero-pulse` dot
 *    inside the eyebrow row, not these full-size background blobs.
 *  - W1212 / W1202 / W1180 cover the eyebrow text, the h1 title, and
 *    the total-count subheading — none touch the orb containers.
 *  - A regression that drops `aria-hidden` from either orb would leak
 *    a stray empty div into the hero's accessible name; a regression
 *    that loses the `lobby-hero-orb--a` / `--b` modifier classes would
 *    silently break the dual-orb visual layout (only one glow would
 *    render, or both would land at the same offset). Pinning the
 *    presence of both modifier-suffixed orbs AND their `aria-hidden`
 *    attribute locks in the decorative-only, two-orb contract.
 */
describe("LobbyPage — hero decorative orbs (W1420)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders two aria-hidden .lobby-hero-orb children with --a and --b modifiers", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const orbA = container.querySelector(
      ".lobby-hero .lobby-hero-orb.lobby-hero-orb--a",
    );
    const orbB = container.querySelector(
      ".lobby-hero .lobby-hero-orb.lobby-hero-orb--b",
    );

    expect(orbA).not.toBeNull();
    expect(orbB).not.toBeNull();
    expect(orbA?.getAttribute("aria-hidden")).toBe("true");
    expect(orbB?.getAttribute("aria-hidden")).toBe("true");
  });
});
