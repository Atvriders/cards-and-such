import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArdRiState, ArdRiAction, ArdRiSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function ArdRiGame({ state, dispatch, onGameOver }: GameProps<ArdRiState, ArdRiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="ar-wrap"><div className="ar-done"><h2>{msg}</h2><div className="ar-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ar-wrap">
      <div className="ar-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="ar-score">Move {state.moves}</div>
      <div className="ar-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`ar-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as ArdRiAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
