import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZammaState, ZammaAction, ZammaSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function ZammaGame({ state, dispatch, onGameOver }: GameProps<ZammaState, ZammaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="zm-wrap"><div className="zm-done"><h2>{msg}</h2><div className="zm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="zm-wrap">
      <div className="zm-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="zm-score">Move {state.moves}</div>
      <div className="zm-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`zm-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as ZammaAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
