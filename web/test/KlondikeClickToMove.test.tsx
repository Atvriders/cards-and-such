import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Klondike } from "../src/games/klondike/Klondike.js";
import type { KlondikeState, KlondikeAction } from "../src/games/klondike/state.js";
import React from "react";

/** Build a minimal Klondike state with a known Ace on the waste pile top. */
function makeStateWithAceOnWaste(): KlondikeState {
  return {
    piles: [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t7", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      {
        id: "waste",
        kind: "waste",
        // faceUpCount deliberately 0 — this is the initial value that caused the bug
        faceUpCount: 0,
        cards: [{ suit: "♠", rank: 1, id: "test-spade-ace" }],
      },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ],
    score: 0,
    movesMade: 0,
    won: false,
    settings: { drawMode: "1", scoringMode: "standard" },
  };
}

describe("Klondike waste click auto-move", () => {
  it("clicking a face-up waste card dispatches a move when a legal destination exists (regression for faceUpCount=0 gate)", () => {
    const dispatch = vi.fn();
    const state = makeStateWithAceOnWaste();

    render(
      <Klondike
        state={state}
        settings={state.settings}
        dispatch={dispatch as (a: KlondikeAction) => void}
        onGameOver={() => {}}
      />,
    );

    // The waste Ace should be rendered with its aria-label
    const aceCard = screen.getByLabelText("A of ♠");
    expect(aceCard).toBeInTheDocument();

    // Simulate the pointer-based click sequence that Card.tsx uses for face-up cards
    fireEvent.pointerDown(aceCard, { clientX: 50, clientY: 50 });
    fireEvent.pointerUp(aceCard, { clientX: 50, clientY: 50 });

    // Expect dispatch to have been called with a move to one of the four foundations
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "move",
        fromPile: "waste",
        toPile: expect.stringMatching(/^f[1-4]$/),
        count: 1,
      }),
    );
  });

  it("clicking a face-up waste card that has NO legal destination does NOT dispatch a move", () => {
    const dispatch = vi.fn();
    // Waste top is K♠. All 7 tableau slots are occupied by K♥ (same rank, so nothing
    // accepts it under Klondike rules — tableau needs rank-1 in opposite color). Foundations empty.
    // No empty tableau exists either (all have a card), so findAutoMove returns null.
    const blockerCard = (id: string) => ({ suit: "♥" as const, rank: 13 as const, id });
    const state: KlondikeState = {
      ...makeStateWithAceOnWaste(),
      piles: makeStateWithAceOnWaste().piles.map((p) => {
        if (p.id === "waste") return { ...p, cards: [{ suit: "♠" as const, rank: 13 as const, id: "test-spade-king" }] };
        // Fill each tableau with a K♥ so no column is empty and none accepts K♠
        if (p.kind === "tableau") return { ...p, cards: [blockerCard(`blocker-${p.id}`)], faceUpCount: 1 };
        return p;
      }),
    };

    render(
      <Klondike
        state={state}
        settings={state.settings}
        dispatch={dispatch as (a: KlondikeAction) => void}
        onGameOver={() => {}}
      />,
    );

    const kingCard = screen.getByLabelText("K of ♠");
    fireEvent.pointerDown(kingCard, { clientX: 50, clientY: 50 });
    fireEvent.pointerUp(kingCard, { clientX: 50, clientY: 50 });

    // No legal move exists — dispatch should NOT have been called with a move action
    const moveCalls = (dispatch.mock.calls as KlondikeAction[][]).filter(
      ([a]) => a?.type === "move",
    );
    expect(moveCalls.length).toBe(0);
  });
});
