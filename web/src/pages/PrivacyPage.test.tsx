import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PrivacyPage from "./PrivacyPage.js";

describe("PrivacyPage", () => {
  it("renders the Privacy heading inside the privacy-page container", () => {
    render(<PrivacyPage />);
    const container = screen.getByTestId("privacy-page");
    const heading = within(container).getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Privacy");
  });

  it("describes localStorage-only data handling and the no-tracking stance", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("localStorage only.");
    expect(text).toContain("No analytics, no tracking.");
    expect(text).toContain("No advertising networks.");
    expect(text).toContain("Google Fonts CDN");
    expect(text).toContain("Optional online play.");
  });

  it("renders the five privacy bullet points in a list", () => {
    render(<PrivacyPage />);
    const container = screen.getByTestId("privacy-page");
    const items = within(container).getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });
});
