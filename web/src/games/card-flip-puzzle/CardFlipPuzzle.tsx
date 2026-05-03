import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFlipPuzzleState, CardFlipPuzzleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./CardFlipPuzzle.css";

const SUIT_ICONS = ["", "♠", "♥", "♦", "♣", "★", "♟", "♘", "⚑"];

export function CardFlipPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardFlipPuzzleState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const waitingClear = state.flipA !== null && state.flipB !== null;

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="card-flip-puzzle">
      <h2>CARD FLIP PUZZLE</h2>
      <div className="cfp-info">
        <span>Pairs: <b>{state.pairsFound}/8</b></span>
        <span>Moves: <b>{state.moves}</b></span>
      </div>

      <div data-testid="hint-target-card-flip-puzzle-grid" className="cfp-grid">
        {state.cards.map((val, i) => {
          const isRevealed = state.revealed[i];
          const isMatched = state.matched[i];
          return (
            <button
              key={i}
              className={`cfp-card${isRevealed || isMatched ? " face-up" : ""}${isMatched ? " matched" : ""}${waitingClear && (i === state.flipA || i === state.flipB) && !isMatched ? " mismatch" : ""}`}
              onClick={() => {
                if (waitingClear) {
                  dispatch({ type: "clearMismatch" } as CardFlipPuzzleAction);
                } else {
                  dispatch({ type: "flip", index: i } as CardFlipPuzzleAction);
                }
              }}
              disabled={state.gameOver || isMatched}
            >
              {isRevealed || isMatched ? SUIT_ICONS[val] : "?"}
            </button>
          );
        })}
      </div>

      {waitingClear && (
        <div className="cfp-hint">No match — tap any card to continue</div>
      )}

      {terminal && (
        <div className="cfp-gameover">
          All pairs found in {state.moves} moves! Score: {terminal.score}
        </div>
      )}
    </div>
  );
}
