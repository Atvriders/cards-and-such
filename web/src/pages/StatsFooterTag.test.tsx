import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1571: StatsPage closes its body with a semantic `<footer>` element
 * (`<footer className="stats-footer">`) that hosts the privacy note and the
 * destructive "Reset stats" button. Existing tests pin the footer's class
 * (W888 via `stats-footer`), the note copy + co-location (W888), the child
 * order (W1346), the reset button's class (W1246), type (W1484) and label
 * (W1545) — but no test pins that the wrapper element is literally a
 * `<footer>` tag (tagName === "FOOTER"). A refactor that swapped the
 * `<footer>` for a `<div className="stats-footer">` would still pass every
 * existing assertion (className present, children co-located, order correct,
 * reset button intact) while silently dropping the HTML5 landmark role
 * `contentinfo` that assistive tech relies on to skip to the page footer.
 * Lock the tagName so any non-semantic regression is caught.
 */
describe("StatsPage footer — wrapper is a <footer> element", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1571: stats-footer wrapper renders as a semantic <footer> tag (tagName 'FOOTER')", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    // Anchor on the privacy note to locate the footer wrapper.
    const note = screen.getByText("Stats are stored locally in your browser.");
    const footer = note.parentElement;
    expect(footer).not.toBeNull();

    // Pin the load-bearing semantic element: must be a literal <footer>
    // (HTML5 implicit landmark role 'contentinfo'), not a generic <div>
    // styled to look like one.
    expect(footer!.tagName).toBe("FOOTER");
    expect(footer!.className).toContain("stats-footer");
  });
});
