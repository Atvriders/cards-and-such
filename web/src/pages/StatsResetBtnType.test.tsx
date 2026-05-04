import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1484: StatsPage's footer "Reset stats" control is rendered with an
 * explicit `type="button"` attribute. Inside the page-level layout the
 * button is not enclosed in a <form>, but JSX defaults <button> to
 * `type="submit"` semantics in browsers when nested inside one — and any
 * future refactor that wraps the footer (or the whole page) in a <form>
 * would silently turn this destructive control into a form submitter,
 * triggering accidental navigation/submission on Enter keypress elsewhere
 * on the page. The author defensively pinned `type="button"` in
 * StatsPage.tsx for exactly this reason. Existing tests cover the
 * button's className (W1246), tagName (W1246 sanity), data-testid, click
 * behavior, and confirm-dialog wiring — but no test pins the
 * `type="button"` attribute itself. Lock it here so a regression that
 * drops the explicit type (or flips it to `submit`) is caught.
 */
describe("StatsPage footer — reset button type attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1484: stats-reset button carries explicit type=\"button\" to prevent form-submit semantics", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-reset");
    // The destructive footer control must explicitly opt out of submit
    // semantics — pin the attribute exactly so a regression that drops
    // or changes it is caught.
    expect(btn.getAttribute("type")).toBe("button");
  });
});
