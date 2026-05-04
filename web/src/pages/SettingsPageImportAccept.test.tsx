import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SettingsPage from "./SettingsPage.js";

// W1241 — focused coverage of the `accept` attribute on the hidden file
// input that backs the "Import" button. SettingsPage.tsx wires this as
// `<input type="file" accept="application/json,.json" .../>` so the
// platform's native file picker filters down to JSON backups by default
// (both via the MIME tag and the `.json` extension fallback for systems
// that don't honour the MIME hint). A regression that dropped the
// attribute would silently widen the picker to "any file" — users would
// then be able to select arbitrary files which fail at parse time inside
// `importAll`. Pin the contract here so a header/data-section refactor
// can't quietly break the filter.
describe("SettingsPage import file-input accept attribute (W1241)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filters the native file picker to JSON via the accept attribute", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    const input = screen.getByTestId("settings-import-input");
    expect(input).toHaveAttribute("accept", "application/json,.json");
    expect(input).toHaveAttribute("type", "file");
  });
});
