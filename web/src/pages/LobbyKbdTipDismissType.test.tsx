import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1553 — the keyboard-shortcut tip's dismiss button
 * (`<button class="lobby-kbd-tip-dismiss">…</button>`) is rendered
 * with the explicit `type="button"` attribute so it never inherits
 * the HTML default of `type="submit"`.
 *
 * Why this needs its own pin:
 *  - W1432 (LobbyKbdTipRole.test.tsx) pins the wrapper's `role`,
 *    W1443 (LobbyKbdTipDismissAria.test.tsx) pins the dismiss
 *    button's `aria-label`, and W1454 (LobbyKbdTipTextClass.test.tsx)
 *    pins the inner text span's className — none of those touch the
 *    button's `type` attribute.
 *  - LobbyPage.test.tsx clicks the dismiss button by `data-testid`
 *    but never asserts the rendered `type`. If the attribute were
 *    dropped, the tip would still appear, but if LobbyPage were ever
 *    nested inside a `<form>` (e.g. the search input is moved into
 *    one) the implicit `submit` would navigate the page on every
 *    dismiss click — a regression that today's tests would miss.
 *
 * Sibling-file placement keeps this attribute pin out of the
 * monolithic LobbyPage.test.tsx so it shares the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits.
 */
describe("LobbyPage — kbd-tip dismiss button type (W1553)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the lobby-kbd-tip-dismiss button with type=\"button\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable className so the lookup itself is
    // independent of the attribute under test (`type`).
    const dismiss = document.querySelector<HTMLElement>(
      ".lobby-kbd-tip-dismiss",
    );
    expect(dismiss).not.toBeNull();
    expect(dismiss!.tagName).toBe("BUTTON");

    // Pin the literal rendered attribute. Using getAttribute reads
    // exactly what JSX placed into the DOM without the
    // HTMLButtonElement.type property bridge — which would silently
    // report "submit" as the implicit default if the attribute were
    // missing.
    expect(dismiss!.getAttribute("type")).toBe("button");
  });
});
