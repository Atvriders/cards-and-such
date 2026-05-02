import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SolitaireClockState, SolitaireClockAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./SolitaireClockTournament.css";

const VAL_LABEL = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const CLOCK_LABELS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

export function SolitaireClockTournament({
  state,
  dispatch,
  onGameOver,
}: GameProps<SolitaireClockState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="clock-tournament">
      <h2>CLOCK TOURNAMENT</h2>
      <div className="ct-info">
        <span>Moves: <b>{state.moves}</b></span>
        <span>Current: <b>{CLOCK_LABELS[state.currentPile]}</b></span>
      </div>

      <div className="ct-clock-face">
        {state.piles.map((pile, idx) => {
          const topCard = pile[pile.length - 1];
          const faceUpCount = pile.filter((c) => c.faceUp).length;
          const isCurrent = idx === state.currentPile;
          return (
            <div
              key={idx}
              className={`ct-pile${isCurrent ? " current" : ""}${idx === 12 ? " center" : ""}`}
            >
              <div className="ct-pile-label">{CLOCK_LABELS[idx]}</div>
              <div className="ct-pile-card">
                {topCard
                  ? topCard.faceUp
                    ? `${VAL_LABEL[topCard.value - 1]}${topCard.suit}`
                    : `(${pile.length})`
                  : "—"
                }
              </div>
              <div className="ct-pile-done">{faceUpCount}/{pile.length}</div>
            </div>
          );
        })}
      </div>

      {state.won && <div className="ct-win">YOU WIN!</div>}
      {state.lost && <div className="ct-lose">4 Kings up — game over!</div>}

      {terminal && (
        <div className="ct-gameover">
          Score: {terminal.score}
        </div>
      )}

      <button
        className="ct-btn"
        data-testid="hint-target-solitaire-clock-tournament-flip"
        onClick={() => dispatch({ type: "flip" } as SolitaireClockAction)}
        disabled={state.gameOver}
      >
        Flip Card
      </button>
    </div>
  );
}
