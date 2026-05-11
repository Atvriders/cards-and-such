import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Skeleton } from "./Skeleton.js";

afterEach(() => {
  cleanup();
});

describe("Skeleton", () => {
  it("renders default rect variant with status role, aria-busy, and Loading aria-label", () => {
    render(<Skeleton />);
    const el = screen.getByTestId("skeleton");
    expect(el.tagName).toBe("SPAN");
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.getAttribute("aria-label")).toBe("Loading");
    expect(el.className).toBe("skeleton skeleton--rect");
  });

  it("applies variant modifier class, numeric dimensions as px, and extra className", () => {
    render(
      <Skeleton
        variant="circle"
        width={48}
        height={48}
        className="avatar-ph"
        ariaLabel="Loading avatar"
      />,
    );
    const el = screen.getByTestId("skeleton");
    expect(el.className).toBe("skeleton skeleton--circle avatar-ph");
    expect(el.getAttribute("aria-label")).toBe("Loading avatar");
    expect((el as HTMLElement).style.width).toBe("48px");
    expect((el as HTMLElement).style.height).toBe("48px");
  });

  it("passes string dimensions through unchanged and merges custom style", () => {
    render(
      <Skeleton
        variant="text-line"
        width="80%"
        height="1em"
        style={{ marginTop: "4px" }}
      />,
    );
    const el = screen.getByTestId("skeleton") as HTMLElement;
    expect(el.className).toBe("skeleton skeleton--text-line");
    expect(el.style.width).toBe("80%");
    expect(el.style.height).toBe("1em");
    expect(el.style.marginTop).toBe("4px");
  });
});
