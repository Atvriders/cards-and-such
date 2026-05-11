import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HowToPlayModal } from "./HowToPlayModal.js";

describe("HowToPlayModal", () => {
  it("renders the title, eyebrow, and parsed body content when open", () => {
    render(
      <HowToPlayModal
        open
        onClose={() => {}}
        title="Klondike"
        text={
          "# Goal\nMove all cards to the foundations.\n\n# How to Play\n- Drag cards between piles\n- Cycle the stock"
        }
      />,
    );
    const modal = screen.getByTestId("htp-modal");
    expect(modal).toBeInTheDocument();
    expect(modal.getAttribute("role")).toBe("dialog");
    expect(modal.getAttribute("aria-modal")).toBe("true");
    expect(screen.getAllByText("How to Play").length).toBeGreaterThan(0);
    expect(screen.getByText("Klondike")).toBeInTheDocument();
    expect(
      screen.getByText("Move all cards to the foundations."),
    ).toBeInTheDocument();
    expect(screen.getByText("Drag cards between piles")).toBeInTheDocument();
  });

  it("invokes onClose when the close button, Got it button, and backdrop are clicked", () => {
    const onClose = vi.fn();
    render(
      <HowToPlayModal
        open
        onClose={onClose}
        title="Test"
        text="Some helpful instructions."
      />,
    );
    fireEvent.click(screen.getByTestId("htp-close"));
    fireEvent.click(screen.getByTestId("htp-gotit"));
    fireEvent.click(screen.getByTestId("htp-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("returns no modal markup when open is false", () => {
    const { container } = render(
      <HowToPlayModal
        open={false}
        onClose={() => {}}
        title="Hidden"
        text="nothing to see"
      />,
    );
    expect(container.querySelector('[data-testid="htp-modal"]')).toBeNull();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(
      <HowToPlayModal
        open
        onClose={onClose}
        title="Test"
        text="content"
      />,
    );
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(onClose).toHaveBeenCalled();
  });
});
