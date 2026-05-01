import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToeBlitzState, TicTacToeBlitzAction, TicTacToeBlitzSettings } from "./state.js";
import { isTerminal, TIMER_TICKS } from "./state.js";
import "./Game.css";

export function TicTacToeBlitzGame({
  state, dispatch, onGameOver,
}: GameProps<TicTacToeBlitzState, TicTacToeBlitzSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TicTacToeBlitzAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  const lowTime = state.ticksRemaining <= 10;

  if (state.phase === "done") {
    return (
      <div className="tttblitz-wrap">
        <div className="tttblitz-done">
          <h2 className="tttblitz-done-title">Time's Up!</h2>
          <div className="tttblitz-stats">
            <span>W:{state.wins}</span>
            <span>D:{state.draws}</span>
            <span>L:{state.losses}</span>
          </div>
          <div className="tttblitz-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const statusText = state.roundOver
    ? state.result === "X" ? "You won the round!" : state.result === "draw" ? "Draw" : "CPU won the round"
    : "Your turn (X)";

  return (
    <div className="tttblitz-wrap">
      <div className="tttblitz-header">
        <span className="tttblitz-info">W:{state.wins} D:{state.draws} L:{state.losses}</span>
        <span className={`tttblitz-timer ${lowTime ? "tttblitz-timer-low" : ""}`}>
          {state.ticksRemaining}s
        </span>
        <span className="tttblitz-score">{state.score} pts</span>
      </div>
      <div className="tttblitz-status">{statusText}</div>
      <div className="tttblitz-board">
        {state.board.map((c, i) => (
          <button
            key={i}
            className={`tttblitz-cell ${c === "X" ? "tttblitz-cell-x" : c === "O" ? "tttblitz-cell-o" : ""}`}
            disabled={c !== null || state.roundOver}
            onClick={() => dispatch({ type: "play", idx: i } as TicTacToeBlitzAction)}
            aria-label={`cell ${i}`}
          >
            {c ?? ""}
          </button>
        ))}
      </div>
      {state.roundOver && (
        <button className="tttblitz-btn" onClick={() => dispatch({ type: "next" } as TicTacToeBlitzAction)}>
          Next Round
        </button>
      )}
      <div className="tttblitz-hint">{TIMER_TICKS}s blitz - finish rounds fast!</div>
    </div>
  );
}
