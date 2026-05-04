import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1387 — pin the explicit `type="button"` attribute on the
 * `lobby-pager-next` control inside the pagination footer.
 *
 * The pager renders its Prev / Next controls as <button> elements that
 * live inside the lobby <section>. A regression that drops the explicit
 * `type="button"` would default the rendered element to `type="submit"`,
 * which would silently submit any ancestor <form> that lands above the
 * route shell (e.g. a debug wrapper capturing POST behaviour) and reload
 * the page on every Next click — obliterating the user's pagination
 * state. The explicit `type="button"` is therefore load-bearing on both
 * Prev and Next; the Prev pin lives in LobbyPagerPrevType.test.tsx
 * (W1342) and this neighbour test mirrors that for Next so each file
 * fails for exactly one reason.
 *
 * The default list-mode is "pagination" (see W183/W582) and the default
 * registry has more than PAGE_SIZE entries, so the pager mounts on first
 * load with no localStorage seeding.
 */
describe("LobbyPage — pager next type=button (W1387)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager-next carries explicit type=button so it cannot submit an ancestor form", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: pagination-mode pager is the mounted footer in the default
    // render — the toggle's persistence twin is empty so
    // `readPersistedListMode()` falls back to "pagination".
    expect(screen.getByTestId("lobby-pager")).toBeInTheDocument();

    const next = screen.getByTestId("lobby-pager-next");
    // Pin the rendered attribute, not just the JSX literal — jsdom
    // surfaces the explicit `type` exactly as authored.
    expect(next).toHaveAttribute("type", "button");
    // Belt-and-suspenders — the element really is a <button>, so the
    // type pin is meaningful (a stray <input type="button"> regression
    // would still satisfy the attribute pin above on its own).
    expect(next.tagName).toBe("BUTTON");
  });
});
