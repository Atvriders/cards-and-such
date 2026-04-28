import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectFourMiniState, ConnectFourMiniAction, ConnectFourMiniSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

export function ConnectFourMiniGame({ state, dispatch, onGameOver }: GameProps<ConnectFourMiniState, ConnectFourMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="cf-wrap"><div className="cf-done"><h2>{msg}</h2><div className="cf-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cf-wrap">
      <div className="cf-info">Drop a piece in any column. Connect 4 to win.</div>
      <div className="cf-score">Turn: {state.turn === "P" ? "You (red)" : "CPU"}</div>
      <div className="cf-board">
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const v = state.board[r * COLS + c];
            const cls = v === "P" ? "p" : v === "C" ? "c" : "";
            return <button key={r * COLS + c} className={`cf-cell col-btn ${cls}`} onClick={() => dispatch({ type:"drop", col: c } as ConnectFourMiniAction)} aria-label={"col " + c}>{""}</button>;
          })
        )}
      </div>
    </div>
  );
}
