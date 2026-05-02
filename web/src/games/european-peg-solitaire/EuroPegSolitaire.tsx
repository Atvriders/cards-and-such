import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EuroPegSolitaireState, EuroPegSettings } from "./state.js";
import { isTerminal, getLegalJumps, hasAnyMove, countPegs } from "./state.js";
import "./EuroPegSolitaire.css";

export function EuroPegSolitaire({
  state,
  dispatch,
  onGameOver,
}: GameProps<EuroPegSolitaireState, EuroPegSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pegsLeft = countPegs(state.cells, state.valid);
  const stuck = !state.won && !hasAnyMove(state.cells, state.valid);

  const legalTargets = new Set<number>();
  if (state.selected !== null) {
    for (const j of getLegalJumps(state.cells, state.valid, state.selected)) {
      legalTargets.add(j.to);
    }
  }

  function handleClick(idx: number) {
    if (terminal || stuck) return;
    const valid = state.valid[idx];
    if (!valid) return;
    dispatch({ type: "select", index: idx });
  }

  return (
    <div className="euro-peg">
      <div className="euro-peg-info">
        <span>Pegs left: {pegsLeft}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className={`euro-peg-status${state.won ? " won" : stuck ? " stuck" : ""}`}>
        {state.won
          ? "Perfect! One peg in the center!"
          : stuck
          ? `Stuck — ${pegsLeft} peg${pegsLeft !== 1 ? "s" : ""} remaining`
          : "Click a peg, then click a green hole to jump"}
      </div>

      <div className="euro-peg-board">
        {Array.from({ length: 49 }, (_, idx) => {
          const valid = state.valid[idx]!;
          const cell = state.cells[idx]!;
          const isSelected = state.selected === idx;
          const isTarget = legalTargets.has(idx);

          let cls = "euro-peg-cell";
          if (!valid) cls += " invalid";
          else if (cell === "peg") cls += " peg" + (isSelected ? " selected" : "");
          else cls += " empty" + (isTarget ? " target" : "");

          return (
            <div
              key={idx}
              data-testid={`hint-target-european-peg-solitaire-${idx}`}
              className={cls}
              onClick={() => handleClick(idx)}
              aria-label={!valid ? undefined : cell === "peg" ? "Peg" : "Empty hole"}
            />
          );
        })}
      </div>

      <p className="euro-peg-hint">
        37-cell European board · Yellow = selected · Green = valid jump
      </p>
    </div>
  );
}
