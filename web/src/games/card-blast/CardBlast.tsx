import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBlastState, CardBlastSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CardBlast.css";

const RED_SUITS = new Set(["♥", "♦"]);

export function CardBlast({ state, dispatch, onGameOver }: GameProps<CardBlastState, CardBlastSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="card-blast">
      <div className="cb-stats">
        <span>Score: {state.score}</span>
        <span>Round: {Math.min(state.round, state.totalRounds)}/{state.totalRounds}</span>
      </div>

      <div className="cb-hand">
        {state.hand.map(card => (
          <button
            key={card.id}
            className={`cb-card${state.selected.includes(card.id) ? " selected" : ""} ${RED_SUITS.has(card.suit) ? "red" : "black"}`}
            onClick={() => dispatch({ type: "toggle", id: card.id })}
            disabled={state.gameOver}
          >
            <span>{card.rank}</span>
            <span className="suit">{card.suit}</span>
          </button>
        ))}
      </div>

      {state.lastBlast && <div className="cb-blast">💥 {state.lastBlast}</div>}
      <div className="cb-message">{state.message}</div>

      {!state.gameOver && (
        <div className="cb-actions">
          <button
            onClick={() => dispatch({ type: "blast" })}
            disabled={state.selected.length === 0}
          >
            💥 Blast!
          </button>
          <button
            onClick={() => dispatch({ type: "discard" })}
            disabled={state.selected.length === 0}
          >
            🗑 Discard
          </button>
        </div>
      )}

      <button onClick={() => dispatch({ type: "restart" })}>New Game</button>
    </div>
  );
}
