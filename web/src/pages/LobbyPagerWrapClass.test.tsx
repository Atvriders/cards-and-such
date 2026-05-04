import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1441 — pin the `lobby-pager` className on the pagination footer's
 * outermost wrapper <div>.
 *
 * In pagination list-mode the footer renders a wrapper that hosts the
 * Prev button, the live status span, and the Next button. The
 * `lobby-pager` class on that wrapper is the canonical CSS hook (see
 * `LobbyPage.css`) for flex layout and gap spacing of those three
 * children. A regression that renames or drops the class — e.g. a
 * refactor that switches to a CSS-in-JS object and forgets to
 * preserve the legacy class — would silently un-style the footer
 * (children would collapse onto each other) without breaking any of
 * the existing testid-based pins, since the testid alone says
 * nothing about the className. The neighbour pins (W1304 aria-live,
 * W1342 prev type, W1387 next type) target the inner controls, so
 * this test pins the wrapper class itself for exactly one reason —
 * the layout hook on the pager container.
 *
 * The default list-mode is "pagination" and the default registry has
 * more than PAGE_SIZE entries, so the pager mounts on first load with
 * no localStorage seeding required.
 */
describe("LobbyPage — pager wrapper className (W1441)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager wrapper carries the lobby-pager class for footer layout", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const pager = screen.getByTestId("lobby-pager");
    expect(pager).toBeInTheDocument();
    // Pin the rendered className — the class is the canonical CSS
    // hook in LobbyPage.css and a refactor that drops it silently
    // un-styles the footer.
    expect(pager).toHaveClass("lobby-pager");
    // Belt-and-suspenders — the wrapper really is a <div>, so the
    // class pin attaches to the layout container we expect.
    expect(pager.tagName).toBe("DIV");
  });
});
