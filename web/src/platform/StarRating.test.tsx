import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./StarRating.js";

describe("StarRating", () => {
  it("renders 5 star radios and marks the correct number filled based on value", () => {
    render(<StarRating value={3} testId="rating" />);
    const root = screen.getByTestId("rating");
    expect(root).toHaveAttribute("role", "radiogroup");
    expect(root).toHaveAttribute("data-value", "3");

    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);

    // First three should be filled, last two not.
    expect(stars[0]).toHaveClass("is-filled");
    expect(stars[1]).toHaveClass("is-filled");
    expect(stars[2]).toHaveClass("is-filled");
    expect(stars[3]).not.toHaveClass("is-filled");
    expect(stars[4]).not.toHaveClass("is-filled");

    // The selected star is the one whose index equals value.
    expect(stars[2]).toHaveAttribute("aria-checked", "true");
    expect(stars[0]).toHaveAttribute("aria-checked", "false");
  });

  it("invokes onChange with the clicked star's value when interactive", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} testId="rating" />);
    const fourth = screen.getByTestId("rating-star-4");
    fireEvent.click(fourth);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("ignores clicks and disables buttons in read-only mode", () => {
    const onChange = vi.fn();
    render(
      <StarRating value={2} onChange={onChange} readOnly testId="rating" />,
    );
    const stars = screen.getAllByRole("radio");
    stars.forEach((s) => expect(s).toBeDisabled());
    fireEvent.click(stars[4]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
