import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1223 — the lobby hero eyebrow row pairs the "Live Catalog" label with
 * a small decorative pulse dot rendered as
 *   <span class="lobby-hero-pulse" aria-hidden="true" />
 * The dot is purely visual; it must stay hidden from the accessibility
 * tree so screen readers don't announce a stray "•" before the eyebrow
 * copy.
 *
 * Why this needs its own pin:
 *  - W1212 (LobbyHeroSubheading) only asserts the eyebrow's textContent
 *    equals "Live Catalog" — it doesn't verify the decorative dot
 *    actually exists or is correctly hidden. A regression that drops
 *    `aria-hidden` from the pulse span would leak it into the eyebrow's
 *    accessible name without breaking the textContent check, and a
 *    regression that removes the span entirely would erase the visual
 *    cue without any test catching it.
 *  - Pinning both the existence of `.lobby-hero-pulse` inside
 *    `.lobby-hero-eyebrow` AND its `aria-hidden="true"` attribute locks
 *    in the decorative-only contract for this hero accent.
 */
describe("LobbyPage — hero eyebrow pulse dot (W1223)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an aria-hidden .lobby-hero-pulse inside the eyebrow", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const pulse = container.querySelector(
      ".lobby-hero-eyebrow .lobby-hero-pulse",
    );
    expect(pulse).not.toBeNull();
    expect(pulse?.getAttribute("aria-hidden")).toBe("true");
  });
});
