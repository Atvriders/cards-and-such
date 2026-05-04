import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1337 — the "Hints per game" slider must expose step=1 so the range
// input snaps to integer values. Without it browsers default to step=1
// for an integer-bounded range, but Chromium has historically allowed
// fractional steps when the attribute is omitted explicitly via JSX
// reordering, and the persisted `cards-hint-count` reader uses
// Number.parseInt — a fractional drag would silently truncate and
// desync the visible meta count from the stored value. W1274 covered
// max=10; W1234 covered the volume slider's min/max/step. This pins
// down the still-uncovered step attribute on the hint-count slider.
describe("SettingsPage hint-count slider step attribute (W1337)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders step=1 on the hints-per-game range input", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-hint-count");
    // Assert the rendered DOM attribute verbatim — checking the
    // property would fall back to the implicit HTML default of 1
    // even when the JSX `step={1}` is removed.
    expect(slider.getAttribute("step")).toBe("1");
  });
});
