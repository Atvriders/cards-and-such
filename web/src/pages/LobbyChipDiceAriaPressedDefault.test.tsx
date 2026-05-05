import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2505 — pin the `aria-pressed` default value on the LobbyPage
 * `chip-dice` element on initial render.
 *
 * Per the `Chip` component at LobbyPage.tsx ~L2651, every category
 * chip renders `<button role="tab" aria-pressed={active} ...>`. On a
 * fresh mount the active category defaults to `"all"` (chip-all), so
 * every other chip — including `chip-dice` — must serialize
 * `aria-pressed="false"` (React stringifies the boolean for ARIA
 * attributes).
 *
 * Sibling coverage:
 *   - LobbyChipDiceBadge.test.tsx (W1434) pins the dice badge count.
 *   - LobbyChipDiceType.test.tsx pins the chip's button type.
 *   - LobbyChipDiceNoId.test.tsx / LobbyChipDiceGlyphAria.test.tsx
 *     pin structural attributes.
 *
 * None of those assert the initial `aria-pressed` value, so a
 * regression that flipped the default (e.g. inverting the
 * `active` prop, hard-coding `aria-pressed={true}`, or wiring the
 * chip to a stale "lastActive" state) would slip past existing
 * coverage.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the
 * project's per-behavior file-per-test convention; this keeps the
 * mega-file from churning and slots cleanly into the
 * `src/pages/Lobby` vitest path filter.
 */
describe("LobbyPage — chip-dice aria-pressed default (W2505)", () => {
  it("renders chip-dice with aria-pressed=\"false\" on initial mount", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const chip = screen.getByTestId("chip-dice");
    expect(chip).toBeInTheDocument();
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });
});
