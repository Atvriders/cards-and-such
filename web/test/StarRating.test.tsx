import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating, readRating, writeRating, readRatings } from "../src/platform/StarRating.js";
import { useState } from "react";

function Harness({ initial = 0 }: { initial?: number }): JSX.Element {
  const [v, setV] = useState(initial);
  return <StarRating value={v} onChange={setV} testId="rt" />;
}

describe("StarRating", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("renders 5 star buttons", () => {
    render(<StarRating value={0} onChange={() => undefined} testId="r" />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`r-star-${i}`)).toBeTruthy();
    }
  });

  it("calling onChange when a star is clicked", () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId("rt-star-3"));
    expect(screen.getByTestId("rt").getAttribute("data-value")).toBe("3");
  });

  it("clicking the same star twice clears the rating", () => {
    render(<Harness initial={4} />);
    fireEvent.click(screen.getByTestId("rt-star-4"));
    expect(screen.getByTestId("rt").getAttribute("data-value")).toBe("0");
  });

  it("renders read-only without onChange (no buttons enabled)", () => {
    render(<StarRating value={3} readOnly testId="ro" />);
    const star = screen.getByTestId("ro-star-2") as HTMLButtonElement;
    expect(star.disabled).toBe(true);
  });

  it("supports keyboard arrow keys", () => {
    render(<Harness initial={2} />);
    const root = screen.getByTestId("rt");
    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(root.getAttribute("data-value")).toBe("3");
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(root.getAttribute("data-value")).toBe("2");
    fireEvent.keyDown(root, { key: "End" });
    expect(root.getAttribute("data-value")).toBe("5");
    fireEvent.keyDown(root, { key: "Home" });
    expect(root.getAttribute("data-value")).toBe("1");
    fireEvent.keyDown(root, { key: "0" });
    expect(root.getAttribute("data-value")).toBe("0");
  });
});

describe("StarRating storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writeRating + readRating round-trip", () => {
    writeRating("klondike", 5);
    expect(readRating("klondike")).toBe(5);
    expect(readRatings()).toEqual({ klondike: 5 });
  });

  it("clamps values into 1..5", () => {
    writeRating("freecell", 9);
    expect(readRating("freecell")).toBe(5);
    writeRating("spider", -3);
    // -3 <= 0 -> deletes
    expect(readRating("spider")).toBe(0);
  });

  it("setting 0 removes the rating", () => {
    writeRating("hearts", 4);
    writeRating("hearts", 0);
    expect(readRatings().hearts).toBeUndefined();
  });

  it("readRating returns 0 for unrated games", () => {
    expect(readRating("nonexistent")).toBe(0);
  });

  it("readRatings tolerates corrupt JSON", () => {
    localStorage.setItem("cards-ratings", "not-json{");
    expect(readRatings()).toEqual({});
  });
});
