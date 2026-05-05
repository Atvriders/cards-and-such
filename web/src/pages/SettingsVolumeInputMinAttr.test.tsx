import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1826 — focused coverage of the raw `min` HTML attribute on the
// SettingsPage Audio → Volume range input. SettingsPage.tsx renders the
// slider with `min={0}` so React serializes a `min="0"` attribute on the
// underlying DOM node. Existing tests pin the slider's IDL `.min`
// property (W1234), the label htmlFor wiring (W1807), and the styling
// className (W1818), but nothing asserts the raw DOM attribute via
// `getAttribute("min")`. The IDL `.min` getter and the DOM attribute
// serialization are technically distinct surfaces — a regression that
// dropped the prop entirely would still leave the IDL `.min` reading
// "" (empty default) while changing the attribute's presence. Pinning
// `getAttribute("min")` keeps the serialized DOM attribute part of the
// public contract.
describe("SettingsPage volume input min attribute (W1826)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("serializes min=\"0\" as a DOM attribute on the volume range input", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider.getAttribute("min")).toBe("0");
  });
});
