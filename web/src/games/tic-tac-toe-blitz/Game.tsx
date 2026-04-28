import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TicTacToeBlitzState, TicTacToeBlitzAction, TicTacToeBlitzSettings } from "./state.js";
import { isTerminal, TIMER_TICKS } from "./state.js";
import "./Game.css";

export function TicTacToeBlitzGame({ state, dispatch, onGameOver }: GameProps<TicTacToeBlitzState, TicTacToeBlitzSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TicTacToeBlitzAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="tb-wrap"><div className="tb-done"><h2>Time's Up!</h2><div>W:{state.wins} D:{state.draws} L:{state.losses}</div><div className="tb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="tb-wrap">
      <div className="tb-header">
        <span className="tb-info">W:{state.wins} D:{state.draws} L:{state.losses}</span>
        <span className="tb-timer">{state.ticksRemaining}s</span>
        <span className="tb-score">{state.score} pts</span>
      </div>
      <div className="tb-board">
        {state.board.map((c, i) => (
          <button key={i} className={`tb-cell ${c === "X" ? "x" : c === "O" ? "o" : ""}`} disabled={c !== null || state.roundOver} onClick={() => dispatch({ type: "play", idx: i } as TicTacToeBlitzAction)}>{c ?? ""}</button>
        ))}
      </div>
      {state.roundOver && <button className="tb-btn alt" onClick={() => dispatch({ type:"next" } as TicTacToeBlitzAction)}>Next Round</button>}
      <div className="tb-info">Timer: {TIMER_TICKS}s blitz - win as many as you can!</div>
    </div>
  );
}
