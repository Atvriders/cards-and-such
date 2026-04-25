import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSharkState, CardSharkAction, CardSharkSettings } from "./state.js";
import { isTerminal, cardValue } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./CardShark.css";

const RANK_LABELS: Record<number, string> = {
  1: "A", 11: "J", 12: "Q", 13: "K",
};
function rankLabel(rank: number): string {
  return RANK_LABELS[rank] ?? String(rank);
}

export function CardShark({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardSharkState, CardSharkSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const cur = state.currentCard;
  const nxt = state.nextCard;

  return (
    <div className="card-shark-game">
      <div className="cs-header">
        <span>Round {state.round}/{state.maxRounds}</span>
        <span>Streak: {state.streak}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="cs-cards">
        <div className="cs-card-slot">
          <div className="cs-label">Current</div>
          {cur && <Card card={cur} faceDown={false} />}
          {cur && <div className="cs-value">Value: {cardValue(cur)}</div>}
        </div>

        <div className="cs-arrow">→</div>

        <div className="cs-card-slot">
          <div className="cs-label">Next</div>
          {nxt && !state.over && <Card card={nxt} faceDown={true} />}
          {state.over && nxt && <Card card={nxt} faceDown={false} />}
        </div>
      </div>

      {state.lastResult && (
        <div className={`cs-result cs-result-${state.lastResult}`}>
          {state.lastResult === "correct" ? `Correct! +${10 * state.streak + 50} pts` :
           state.lastResult === "tie" ? "Tie! +10 pts" : "Wrong!"}
        </div>
      )}

      {!state.over && (
        <div className="cs-controls">
          <button
            className="cs-btn cs-btn-higher"
            onClick={() => dispatch({ type: "higher" } as CardSharkAction)}
          >
            Higher
          </button>
          <button
            className="cs-btn cs-btn-lower"
            onClick={() => dispatch({ type: "lower" } as CardSharkAction)}
          >
            Lower
          </button>
        </div>
      )}

      {state.over && (
        <div className="cs-over">
          <div>Game Over!</div>
          <div>Score: {state.score} | Best Streak: {state.bestStreak}</div>
        </div>
      )}

      <div className="cs-hint">
        Guess whether the next card is higher or lower than {cur ? rankLabel(cur.rank) : "?"}
      </div>
    </div>
  );
}
