import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useRef } from "react";
import { useFocusTrap, focusableIn } from "./useFocusTrap.js";

function Harness({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div>
      <button data-testid="outside">outside</button>
      <div ref={ref} data-testid="trap" tabIndex={-1}>
        <button data-testid="first">first</button>
        <button data-testid="middle">middle</button>
        <button data-testid="last">last</button>
      </div>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable inside the container when activated", () => {
    const { getByTestId } = render(<Harness active />);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("wraps focus from last -> first on Tab and first -> last on Shift+Tab", () => {
    const { getByTestId } = render(<Harness active />);
    const first = getByTestId("first");
    const last = getByTestId("last");

    // Move focus to the last element, then a forward Tab should wrap to first.
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    // From first, a Shift+Tab should wrap to last.
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("focusableIn skips disabled and aria-hidden nodes", () => {
    const root = document.createElement("div");
    const mk = (id: string, opts: { disabled?: boolean; ariaHidden?: boolean } = {}) => {
      const b = document.createElement("button");
      b.id = id;
      b.textContent = id;
      if (opts.disabled) b.setAttribute("disabled", "");
      if (opts.ariaHidden) b.setAttribute("aria-hidden", "true");
      root.appendChild(b);
    };
    mk("a");
    mk("b", { disabled: true });
    mk("c", { ariaHidden: true });
    mk("d");
    const ids = focusableIn(root).map((n) => n.id);
    expect(ids).toEqual(["a", "d"]);
  });
});
