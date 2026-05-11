import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders fill width proportional to value/max and sets aria attributes", () => {
    render(<ProgressBar value={3} max={10} label="Round" testId="pb" />);
    const bar = screen.getByTestId("pb");
    expect(bar.getAttribute("role")).toBe("progressbar");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("10");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-label")).toBe("Round");
    expect(screen.getByTestId("pb-label").textContent).toBe("Round");
    const fill = screen.getByTestId("pb-fill") as HTMLElement;
    expect(fill.style.width).toBe("30%");
  });

  it("clamps value above max to 100% width and aria-valuenow to max", () => {
    render(<ProgressBar value={50} max={10} testId="pb2" ariaLabel="Done" />);
    const bar = screen.getByTestId("pb2");
    expect(bar.getAttribute("aria-valuenow")).toBe("10");
    expect(bar.getAttribute("aria-label")).toBe("Done");
    const fill = screen.getByTestId("pb2-fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("renders 0% width when max is 0 or value is negative", () => {
    const { rerender } = render(
      <ProgressBar value={5} max={0} testId="pb3" />,
    );
    let bar = screen.getByTestId("pb3");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("0");
    let fill = screen.getByTestId("pb3-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");

    rerender(<ProgressBar value={-3} max={10} testId="pb3" />);
    bar = screen.getByTestId("pb3");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    fill = screen.getByTestId("pb3-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });
});
