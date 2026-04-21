import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "./Card.js";
import type { Card as CardType } from "./index.js";

function aceOfSpades(): CardType {
  return { suit: "♠", rank: 1 as const, id: "test-spades-1" };
}

describe("Card click vs drag disambiguation", () => {
  it("fires onClick for a pointer down/up with no movement", () => {
    const handler = vi.fn();
    render(<Card card={aceOfSpades()} onClick={handler} />);
    const el = screen.getByLabelText(/A of ♠/);
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires onClick for a tiny tremor (3px)", () => {
    const handler = vi.fn();
    render(<Card card={aceOfSpades()} onClick={handler} />);
    const el = screen.getByLabelText(/A of ♠/);
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 103, clientY: 102 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when movement exceeds tolerance (drag)", () => {
    const handler = vi.fn();
    render(<Card card={aceOfSpades()} onClick={handler} />);
    const el = screen.getByLabelText(/A of ♠/);
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(el, { clientX: 200, clientY: 200 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("does not fire onClick after pointer cancel (drag started)", () => {
    const handler = vi.fn();
    render(<Card card={aceOfSpades()} onClick={handler} />);
    const el = screen.getByLabelText(/A of ♠/);
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100 });
    fireEvent.pointerCancel(el);
    fireEvent.pointerUp(el, { clientX: 100, clientY: 100 });
    expect(handler).not.toHaveBeenCalled();
  });

  it("face-down card uses onClick directly (no drag conflict)", () => {
    const handler = vi.fn();
    render(<Card faceDown onClick={handler} />);
    const el = screen.getByLabelText(/face-down card/);
    fireEvent.click(el);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
