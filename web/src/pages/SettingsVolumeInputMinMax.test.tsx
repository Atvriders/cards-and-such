import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2342 — focused coverage of the raw `max` HTML attribute on the
// SettingsPage Audio → Volume range input. SettingsPage.tsx renders the
// slider with `max={100}` so React serializes a `max="100"` attribute on
// the underlying DOM node. Existing tests pin:
//   - the IDL `.min` / `.max` / `.step` properties (W1234)
//   - `getAttribute("min")` on the volume input (W1826)
//   - `getAttribute("step")` on the volume input (W2204)
// but nothing asserts the raw `max` DOM attribute via
// `getAttribute("max")`. The IDL `.max` getter and the DOM attribute
// serialization are technically distinct surfaces — a regression that
// dropped the `max` prop entirely would still leave the IDL `.max`
// reading "100" only because the input clamps internally; a refactor
// that swapped to a CSS-driven custom slider with no native bounds
// would silently regress the serialized attribute. Pinning
// `getAttribute("max")` keeps the serialized DOM attribute — the
// surface that screen readers and external tooling rely on — part of
// the public contract.
describe("SettingsPage volume input max attribute (W2342)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("serializes max=\"100\" as a DOM attribute on the volume range input", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider.getAttribute("max")).toBe("100");
  });
});
