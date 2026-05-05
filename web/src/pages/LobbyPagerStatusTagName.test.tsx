import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2462 — pin the tagName of the `.lobby-pager-status` element inside
 * the pagination footer.
 *
 * The pager status sits between the Prev / Next buttons and reads
 * "Page <safePage> of <totalPages>". It is rendered as a <span> so that
 * it stays inline with the surrounding flex row of pager controls and
 * does not introduce block-level layout shifts when its contents change.
 * Promoting it to a <div> (or any block element) would visibly break the
 * pager flex row and could also change announcement semantics for some
 * AT, so we lock the tag name here.
 *
 * Sibling pin: aria-live="polite" is already pinned by W1304, so this
 * test deliberately stays narrow and only asserts the tag name.
 */
describe("LobbyPage — pager status tagName (W2462)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lobby-pager-status element is rendered as a SPAN tag", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pagination mode is the default, so the pager footer mounts on first render.
    const pager = screen.getByTestId("lobby-pager");
    expect(pager).toBeInTheDocument();

    const status = pager.querySelector(".lobby-pager-status");
    expect(status).not.toBeNull();
    expect(status?.tagName).toBe("SPAN");
  });
});
