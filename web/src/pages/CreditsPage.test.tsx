import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreditsPage from "./CreditsPage.js";

describe("CreditsPage", () => {
  it("opens external links safely with target=_blank and rel noopener noreferrer", () => {
    const { container } = render(
      <MemoryRouter>
        <CreditsPage />
      </MemoryRouter>,
    );
    const externalAnchors = Array.from(
      container.querySelectorAll('a[href^="http"]'),
    ) as HTMLAnchorElement[];
    expect(externalAnchors.length).toBeGreaterThan(0);
    for (const a of externalAnchors) {
      expect(a.getAttribute("target")).toBe("_blank");
      const rel = a.getAttribute("rel") ?? "";
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });
});
