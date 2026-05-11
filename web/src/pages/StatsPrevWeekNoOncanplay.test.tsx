import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * plain presentational <ul>. The `oncanplay` event handler attribute is a
 * media-element event hook (fired when an <audio> or <video> element has
 * buffered enough data to begin playback) and has no defined semantics on a
 * <ul>. Setting it would still register an inline JavaScript handler via DOM
 * serialization, creating a stealth XSS sink and a confusing event surface on
 * what should be a static list. Sibling tests pin the absence of many
 * attributes on this node; this test pins the absence of `oncanplay` so any
 * future change that accidentally attaches a media event handler to this
 * non-media element is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncanplay attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncanplay attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncanplay")).toBe(false);
    expect(ul.getAttribute("oncanplay")).toBeNull();
  });
});
