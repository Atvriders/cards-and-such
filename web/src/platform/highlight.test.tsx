import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { highlightMatch } from "./highlight.js";

describe("highlightMatch", () => {
  it("returns plain text when query is empty", () => {
    const { container } = render(<>{highlightMatch("Hello world", "")}</>);
    expect(container.querySelector("mark")).toBeNull();
    expect(container.textContent).toBe("Hello world");
  });

  it("wraps a single substring match in <mark>", () => {
    const { container } = render(<>{highlightMatch("Hello world", "world")}</>);
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe("world");
    expect(container.textContent).toBe("Hello world");
  });

  it("matches case-insensitively while preserving original casing", () => {
    const { container } = render(<>{highlightMatch("Hello World", "WORLD")}</>);
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    // Preserves the original-cased slice from `text`, not the query.
    expect(mark?.textContent).toBe("World");
    expect(container.textContent).toBe("Hello World");
  });

  it("returns plain text when there is no match", () => {
    const { container } = render(<>{highlightMatch("Hello world", "xyz")}</>);
    expect(container.querySelector("mark")).toBeNull();
    expect(container.textContent).toBe("Hello world");
  });

  it("treats special regex chars in the query as literal text", () => {
    // If the implementation ever swapped to RegExp without escaping, "(.*)+"
    // would either explode or match everything; with literal indexOf it must
    // simply not match here, and must match where it appears verbatim.
    const noMatch = render(<>{highlightMatch("Hello world", "(.*)+")}</>);
    expect(noMatch.container.querySelector("mark")).toBeNull();
    expect(noMatch.container.textContent).toBe("Hello world");

    const literal = render(<>{highlightMatch("price: $9.99 (sale)", "$9.99")}</>);
    const mark = literal.container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toBe("$9.99");
    expect(literal.container.textContent).toBe("price: $9.99 (sale)");
  });
});
