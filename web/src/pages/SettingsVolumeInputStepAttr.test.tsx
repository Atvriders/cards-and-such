import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W2204 — focused coverage of the raw `step` HTML attribute on the
// SettingsPage Audio → Volume range input. SettingsPage.tsx renders the
// slider with `step={1}` so React serializes a `step="1"` attribute on
// the underlying DOM node. Existing tests pin the slider's IDL
// `.step` property (W1234, via `slider.step`) and the raw `min`
// attribute (W1826), but nothing asserts the raw DOM `step` attribute
// via `getAttribute("step")`. The IDL `.step` getter and the DOM
// attribute serialization are technically distinct surfaces — a
// regression that dropped the JSX prop entirely would still leave the
// IDL `.step` reading "1" (the spec default for type=range) while
// removing the attribute from the DOM. Pinning `getAttribute("step")`
// keeps the serialized DOM attribute part of the public contract and
// guards against silent drift to fractional or larger increments.
describe("SettingsPage volume input step attribute (W2204)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("serializes step=\"1\" as a DOM attribute on the volume range input", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const slider = screen.getByTestId("settings-volume");
    expect(slider.getAttribute("step")).toBe("1");
  });
});
