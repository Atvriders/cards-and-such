import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal, ROWS, COLS, TARGET, MODE } from "./state.js";
import "./Game.css";

export function ConnectGame({ state, dispatch, onGameOver }: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="cn-wrap"><div className="cn-done bounce-in"><h2>{msg}</h2><div className="cn-final">Score: {state.score}</div></div></div>;
  }

  function topRow(col: number): number {
    for (let r = ROWS - 1; r >= 0; r--) if (state.board[r * COLS + col] === null) return r;
    return -1;
  }

  return (
    <div className="cn-wrap fade-in">
      <div className="cn-info">{TARGET}-in-a-row wins. {MODE === "gravity" ? "Gravity drop." : "Place anywhere."}</div>
      <div className="cn-score">Turn: {state.turn === "P" ? "You (red)" : "CPU"}</div>
      <div className="cn-board" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const v = state.board[r * COLS + c];
            const cls = v === "P" ? "p" : v === "C" ? "c" : "";
            const onClick = () => {
              if (MODE === "gravity") {
                const tr = topRow(c);
                if (tr >= 0) dispatch({ type: "place", row: tr, col: c } as ConnectAction);
              } else {
                dispatch({ type: "place", row: r, col: c } as ConnectAction);
              }
            };
            return <button key={r * COLS + c} className={`cn-cell ${cls}`} onClick={onClick} aria-label={`r${r}c${c}`} />;
          })
        )}
      </div>
    </div>
  );
}
