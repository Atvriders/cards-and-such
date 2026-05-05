import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2055 — focused coverage of the raw `id` HTML attribute on the
// SettingsPage Audio → Volume range input. SettingsPage.tsx renders the
// slider with `id="settings-volume"` so the matching `<label htmlFor>`
// wires click-to-focus and assistive-tech grouping. Existing tests pin
// the testid, the label htmlFor (W1807), the IDL `.min` (W1234), and the
// raw `min` attribute (W1826), but nothing pins the raw `id` attribute
// itself via strict `getAttribute("id")` equality. A regression that
// renamed the input id or dropped it entirely would silently break the
// label↔input pairing the rest of the app depends on. Pinning the exact
// attribute string keeps the id stable as part of the public contract.
describe("SettingsPage volume input id attribute (W2055)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the volume range input with id=\"settings-volume\"", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider.getAttribute("id") === "settings-volume").toBe(true);
  });
});
