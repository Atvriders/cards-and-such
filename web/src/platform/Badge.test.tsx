import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Badge } from "./Badge.js";

afterEach(() => {
  cleanup();
});

describe("Badge", () => {
  it("renders the default uppercase label for each kind with the matching modifier class", () => {
    const cases: Array<{ kind: Parameters<typeof Badge>[0]["kind"]; text: string }> = [
      { kind: "new", text: "NEW" },
      { kind: "popular", text: "POPULAR" },
      { kind: "quick", text: "QUICK" },
      { kind: "challenging", text: "CHALLENGING" },
      { kind: "editors-pick", text: "EDITOR'S PICK" },
    ];
    for (const { kind, text } of cases) {
      const { container, unmount } = render(<Badge kind={kind} />);
      const span = container.querySelector("span");
      expect(span).not.toBeNull();
      expect(span!.textContent).toBe(text);
      expect(span!.className).toBe(`badge badge--${kind}`);
      expect(span!.getAttribute("aria-label")).toBe(text);
      unmount();
    }
  });

  it("uses a custom label as both text and aria-label when provided", () => {
    render(<Badge kind="new" label="Fresh" testId="badge-new" />);
    const el = screen.getByTestId("badge-new");
    expect(el.tagName).toBe("SPAN");
    expect(el.textContent).toBe("Fresh");
    expect(el.getAttribute("aria-label")).toBe("Fresh");
    expect(el.className).toContain("badge--new");
  });

  it("omits the data-testid attribute when no testId prop is passed", () => {
    const { container } = render(<Badge kind="popular" />);
    const span = container.querySelector("span.badge");
    expect(span).not.toBeNull();
    expect(span!.hasAttribute("data-testid")).toBe(false);
  });
});
