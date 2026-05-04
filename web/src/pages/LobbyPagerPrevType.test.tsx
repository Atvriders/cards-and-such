import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1342 — pin the explicit `type="button"` attribute on the
 * `lobby-pager-prev` control inside the pagination footer.
 *
 * The pager renders its Prev / Next controls as <button> elements that
 * live INSIDE the lobby <section>, which itself sits inside the route's
 * top-level <form>-free shell — but Hub layouts have historically wrapped
 * tools/preferences in <form> blocks for the chip strip and search box,
 * and a regression that drops `type="button"` would default the element
 * to `type="submit"`. A submit-type Prev button would silently submit any
 * ancestor <form> that lands above it (e.g. a debug shell wrapping the
 * route in a form to capture POST behaviour) and reload the page,
 * obliterating the user's pagination state. The explicit `type="button"`
 * is therefore load-bearing: it MUST stay on the rendered element, not
 * just the JSX source.
 *
 * The default list-mode is "pagination" (see W183/W582) and the default
 * registry has more than PAGE_SIZE entries, so the pager mounts on first
 * load with no localStorage seeding. The sibling `lobby-pager-next`
 * `type="button"` pin is left to its own neighbour test so that this
 * file fails for exactly one reason — the Prev control's button-type.
 */
describe("LobbyPage — pager prev type=button (W1342)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager-prev carries explicit type=button so it cannot submit an ancestor form", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: pagination-mode pager is the mounted footer in the default
    // render — the toggle's persistence twin is empty so
    // `readPersistedListMode()` falls back to "pagination".
    expect(screen.getByTestId("lobby-pager")).toBeInTheDocument();

    const prev = screen.getByTestId("lobby-pager-prev");
    // Pin the rendered attribute, not just the JSX literal — jsdom
    // surfaces the explicit `type` exactly as authored.
    expect(prev).toHaveAttribute("type", "button");
    // Belt-and-suspenders — the element really is a <button>, so the
    // type pin is meaningful (a stray <input type="button"> regression
    // would still satisfy the attribute pin above on its own).
    expect(prev.tagName).toBe("BUTTON");
  });
});
