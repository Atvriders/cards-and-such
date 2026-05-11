import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `ontimeupdate` IDL attribute is a media
 * event handler that only has defined behavior on <audio> and <video>
 * elements (and their HTMLMediaElement subclass). On a <ul> it carries no
 * meaningful semantics, but if accidentally attached it would be exposed
 * via DOM serialization and could fire arbitrary inline JavaScript if a
 * `timeupdate` event were ever dispatched at the element. Pinning the
 * absence here ensures any future change that attaches `ontimeupdate` to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontimeupdate attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontimeupdate attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontimeupdate")).toBe(false);
    expect(ul.getAttribute("ontimeupdate")).toBeNull();
  });
});
