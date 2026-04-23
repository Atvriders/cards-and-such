import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLineupState, CardLineupSettings } from "./state.js";
import { isTerminal, rankLabel } from "./state.js";
import "./CardLineup.css";

export function CardLineup({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardLineupState, CardLineupSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleCardClick(idx: number): void {
    if (state.solved) return;
    if (state.selected === null) {
      dispatch({ type: "select", idx });
    } else {
      dispatch({ type: "swap", idx });
    }
  }

  return (
    <div className="cl-game">
      <div className="cl-title">Card Lineup</div>

      <div className="cl-stats">
        <span>Moves: {state.moves}</span>
        <span>Score: {Math.max(0, 200 - state.moves * 10)}</span>
      </div>

      <div className="cl-instruction">
        {state.selected !== null
          ? "Click another card to swap it"
          : "Click a card to select it, then click another to swap"}
      </div>

      <div className="cl-cards">
        {state.cards.map((card, i) => {
          const isRed = card.suit === "♥" || card.suit === "♦";
          const isSelected = state.selected === i;
          return (
            <div
              key={i}
              className={`cl-card ${isRed ? "red" : "black"} ${isSelected ? "selected" : ""} ${state.solved ? "solved" : ""}`}
              onClick={() => handleCardClick(i)}
            >
              <div className="cl-card-top">{rankLabel(card.rank)}{card.suit}</div>
              <div className="cl-card-mid">{card.suit}</div>
              <div className="cl-card-bot">{rankLabel(card.rank)}{card.suit}</div>
            </div>
          );
        })}
      </div>

      <div className="cl-goal">
        <div className="cl-goal-label">Sort low → high (2 to A)</div>
      </div>

      {state.solved && (
        <div className="cl-game-over">
          Sorted in {state.moves} move{state.moves !== 1 ? "s" : ""}!<br />
          <span className="cl-final-score">Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
