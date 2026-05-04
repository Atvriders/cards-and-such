import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1411 — the Gameplay → Animations picker is a radiogroup of three
// pill buttons (full/reduced/off). The wrapper <div role="radiogroup">
// must carry aria-label="Animations" so screen-reader users hear the
// group name when entering the radio set; without it, the three
// children read as bare radios with no shared context. W751 already
// pinned down the per-tile selected behavior; this pins the still-
// uncovered radiogroup-level a11y label.
describe("SettingsPage animations radiogroup aria-label (W1411)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders aria-label=\"Animations\" on the radiogroup wrapper", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    // getByRole+name is the SR-equivalent lookup — if the attribute
    // gets renamed or dropped this query throws.
    const group = screen.getByRole("radiogroup", { name: "Animations" });
    expect(group.getAttribute("aria-label")).toBe("Animations");
  });
});
