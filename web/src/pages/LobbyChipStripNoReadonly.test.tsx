import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2913 — the LobbyPage `.lobby-chips` chip-strip <div> MUST NOT carry
 * an HTML `readonly` attribute.
 *
 * Source surface (LobbyPage.tsx ~L2623-2630):
 *
 *     <div
 *       ref={trackRef}
 *       className="lobby-chips"
 *       role="tablist"
 *       aria-label="Filter by category"
 *     >
 *       {children}
 *     </div>
 *
 * Per the HTML spec, the `readonly` content attribute is only defined on
 * `<input>`, `<textarea>`, and form-associated custom elements. Placing
 * it on a generic `<div>` (especially one acting as `role="tablist"`) is
 * an invalid attribute that:
 *
 *   1. Is silently ignored by user agents but still surfaces in
 *      attribute-driven snapshot tooling, fuzzers, and HTML validators
 *      as an authoring error.
 *   2. Misleads downstream consumers (selector-based scrapers, e2e
 *      tests, a11y linters) into treating the navigation surface as
 *      some kind of read-only form control.
 *   3. Couples this navigation tablist to editable widgets whose
 *      `readonly` semantics this codebase pins separately. Mirroring
 *      that contract onto a tablist would conflate two unrelated
 *      surfaces.
 *
 * Sibling W2795 (LobbyChipStripNoAriaReadonly) covers `aria-readonly`
 * absence on the same strip; this pin closes the orthogonal gap for
 * the HTML `readonly` content attribute. None of the existing
 * chip-strip / chip-all tests in this directory assert against the
 * plain `readonly` attribute on the strip container itself.
 *
 * Resolves the strip via `document.querySelector(".lobby-chips")` so
 * the assertion is locale-independent and immune to translation-key
 * or aria-label changes.
 */
describe("LobbyPage — .lobby-chips strip has no readonly attribute (W2913)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the .lobby-chips <div> does NOT carry a readonly attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const strip = document.querySelector(".lobby-chips");

    // Sanity: the chip-strip surface must actually be present in the
    // rendered tree — otherwise a future refactor that renamed the
    // class could silently turn this into a vacuous pass.
    expect(strip).not.toBeNull();

    // The actual contract: no `readonly` attribute on the strip.
    // Use `hasAttribute` rather than checking for null/empty — a
    // `readonly=""` would still be a (broken) public attribute surface
    // that attribute-driven tooling could come to mis-handle, and
    // `getAttribute("readonly")` returning "" would silently pass a
    // `.toBeFalsy()` style assertion.
    expect(strip!.hasAttribute("readonly")).toBe(false);
  });
});
