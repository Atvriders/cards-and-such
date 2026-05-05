import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2511 — pin the `aria-pressed` default value on the LobbyPage
 * `chip-board` element on initial render.
 *
 * Per the `Chip` component at LobbyPage.tsx ~L2651, every category
 * chip renders `<button role="tab" aria-pressed={active} ...>`. On a
 * fresh mount the active category defaults to `"all"` (chip-all), so
 * every other chip — including `chip-board` — must serialize
 * `aria-pressed="false"` (React stringifies the boolean for ARIA
 * attributes).
 *
 * Sibling coverage:
 *   - LobbyChipBoardBadge.test.tsx (W1433) pins the board badge count.
 *   - LobbyChipBoardType.test.tsx (W2473) pins the chip's button type.
 *   - LobbyChipBoardNoId.test.tsx (W2495) pins the absence of an `id`.
 *   - LobbyChipBoardGlyphAria.test.tsx (W1499) pins the glyph
 *     `aria-hidden="true"` contract.
 *
 * None of those assert the initial `aria-pressed` value, so a
 * regression that flipped the default (e.g. inverting the
 * `active` prop, hard-coding `aria-pressed={true}`, or wiring the
 * chip to a stale "lastActive" state) would slip past existing
 * coverage. Analogous pins exist for chip-dice (W2505), chip-cards,
 * chip-arcade, and chip-hidden — this fills the chip-board gap.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * project's per-behavior file-per-test convention; this keeps the
 * mega-file from churning and slots cleanly into the
 * `src/pages/Lobby` vitest path filter.
 */
describe("LobbyPage — chip-board aria-pressed default (W2511)", () => {
  it("renders chip-board with aria-pressed=\"false\" on initial mount", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-board");
    expect(chip).toBeInTheDocument();
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});
