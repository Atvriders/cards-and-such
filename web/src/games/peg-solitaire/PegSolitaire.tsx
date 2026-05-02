import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PegSolitaireState, PegSolitaireSettings, PegSolitaireAction } from "./state.js";
import { isTerminal, getLegalJumps, hasAnyMove, countPegs } from "./state.js";
import "./PegSolitaire.css";

export function PegSolitaire({
  state,
  dispatch,
  onGameOver,
}: GameProps<PegSolitaireState, PegSolitaireSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pegsLeft = countPegs(state.cells, state.valid);
  const stuck = !state.won && !hasAnyMove(state.cells, state.valid);

  // Legal jump targets from selected
  const legalTargets = new Set<number>();
  if (state.selected !== null) {
    for (const j of getLegalJumps(state.cells, state.valid, state.selected)) {
      legalTargets.add(j.to);
    }
  }

  function handleClick(idx: number) {
    if (terminal || stuck) return;
    const cell = state.cells[idx];
    const valid = state.valid[idx];
    if (!valid) return;

    if (cell === "peg") {
      dispatch({ type: "select", index: idx } as PegSolitaireAction);
    } else if (cell === "empty" && state.selected !== null && legalTargets.has(idx)) {
      // Find the jump
      const jumps = getLegalJumps(state.cells, state.valid, state.selected);
      const jump = jumps.find((j) => j.to === idx);
      if (jump) {
        dispatch({ type: "jump", from: state.selected, over: jump.over, to: idx } as PegSolitaireAction);
      }
    }
  }

  return (
    <div className="peg-solitaire">
      <div className="peg-solitaire-info">
        <span>Pegs left: {pegsLeft}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className={`peg-solitaire-status${state.won ? " won" : stuck ? " stuck" : ""}`}>
        {state.won
          ? "Perfect! One peg in the center!"
          : stuck
          ? `No more moves — ${pegsLeft} peg${pegsLeft !== 1 ? "s" : ""} remaining`
          : "Click a peg, then click where it should jump"}
      </div>

      <div className="peg-solitaire-board">
        {Array.from({ length: 49 }, (_, idx) => {
          const valid = state.valid[idx]!;
          const cell = state.cells[idx]!;
          const isSelected = state.selected === idx;
          const isTarget = legalTargets.has(idx);

          let cls = "peg-solitaire-cell";
          if (!valid) cls += " invalid";
          else if (cell === "peg") cls += " peg" + (isSelected ? " selected" : "");
          else cls += " empty" + (isTarget ? " target" : "");

          return (
            <div
              key={idx}
              data-testid={`hint-target-peg-solitaire-${idx}`}
              className={cls}
              onClick={() => handleClick(idx)}
              aria-label={!valid ? undefined : cell === "peg" ? "Peg" : "Empty hole"}
            />
          );
        })}
      </div>

      <p className="peg-solitaire-hint">
        Select a peg (yellow = selected) · Green holes show valid jump destinations
      </p>
    </div>
  );
}
