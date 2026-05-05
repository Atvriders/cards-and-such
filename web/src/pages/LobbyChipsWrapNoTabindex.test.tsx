import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2272 — the chip-strip OUTER wrapper (`.lobby-chips-wrap`) MUST NOT
 * carry a `tabindex` attribute. The wrapper is rendered (LobbyPage.tsx
 * ~L2611-L2614) as a bare presentational <div>:
 *
 *     <div
 *       className={`lobby-chips-wrap${canLeft ? " has-overflow-left" : ""}${canRight ? " has-overflow-right" : ""}`}
 *     >
 *       <button … tabIndex={-1}>‹</button>
 *       <div className="lobby-chips" role="tablist" …>{children}</div>
 *       <button … tabIndex={-1}>›</button>
 *     </div>
 *
 * The actionable focus surfaces inside the wrap are:
 *   - the two `.lobby-chips-arrow` overflow buttons (each `tabIndex={-1}`
 *     pinned by LobbyChipArrowLeftTabIndex / LobbyChipArrowRightTabIndex);
 *   - the chip <button>s inside `.lobby-chips`, which manage focus via
 *     the standard tablist roving-tabindex pattern.
 *
 * The outer wrap itself is purely a layout/positioning container and
 * is intentionally NOT in the keyboard tab order. None of the existing
 * sibling pins covers this absence:
 *   - LobbyChipsWrapAttr.test.tsx (W1997) pins `getAttribute("role") === null`.
 *   - LobbyChipsWrapClass.test.tsx (W1967) pins exact `className`.
 *   - LobbyChipsWrapNoId.test.tsx pins absence of `id`.
 *   - LobbyChipsWrapNoStyle.test.tsx pins absence of inline `style`.
 *   - LobbyChipStripWrap.test.tsx (W1286) pins tagName + classList.
 *   - LobbyChipStripNoTabindex.test.tsx (W2228) pins the INNER
 *     `.lobby-chips` track's lack of tabindex — NOT the outer wrap.
 *
 * A regression that added e.g. `tabIndex={0}` to the outer wrapper
 * would silently:
 *   1. Insert the entire chip-strip container into the keyboard tab
 *      order BEFORE its inner tablist children, so a Tab press would
 *      land on the empty wrapper before reaching any actionable chip
 *      or scroll-arrow button.
 *   2. Or, with `tabIndex={-1}`, make the wrapper programmatically
 *      focusable (`element.focus()` would succeed) and create a new
 *      undeclared focus surface that screen-reader scripts and tests
 *      could come to rely on.
 *
 * One focused assertion: `wrap.hasAttribute("tabindex") === false`.
 * `hasAttribute` (rather than checking a specific value) records the
 * absence at the DOM-attribute level — even `tabindex="-1"` would fail.
 *
 * We resolve the wrapper via the inner `.lobby-chips` track's
 * `parentElement` — the same anchor W1997 / W1286 / W1967 use — so the
 * lookup itself does not depend on the attribute under test.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2228 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — chip-strip wrapper has no tabindex attribute (W2272)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the .lobby-chips-wrap outer <div> WITHOUT a tabindex attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the inner tablist track's stable className. There is a
    // sibling drawer tablist with role="tablist" elsewhere in the tree,
    // so querySelector on the .lobby-chips className is safer than
    // getByRole("tablist") here.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();
    // Sanity: confirm the inner track is the one that owns the
    // `role="tablist"`, so we know we're walking up to the right wrap.
    expect(strip!.getAttribute("role")).toBe("tablist");

    const wrap = strip!.parentElement;
    expect(wrap).not.toBeNull();
    // Sanity: anchor is the chip-strip wrapper, not some other ancestor.
    expect(wrap!.tagName).toBe("DIV");
    expect(wrap!.classList.contains("lobby-chips-wrap")).toBe(true);

    // The actual contract: no `tabindex` attribute on the outer
    // wrapper. `hasAttribute` is the right accessor here — even
    // `tabindex="-1"` would make the wrapper programmatically focusable
    // and create a new undeclared focus surface, so we pin the absence
    // of the attribute itself rather than a specific value.
    expect(wrap!.hasAttribute("tabindex")).toBe(false);
  });
});
