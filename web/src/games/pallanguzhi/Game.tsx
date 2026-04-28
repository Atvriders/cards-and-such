import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PallanguzhiState, PallanguzhiAction, PallanguzhiSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function PallanguzhiGame({ state, dispatch, onGameOver }: GameProps<PallanguzhiState, PallanguzhiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="pg-wrap"><div className="pg-done"><h2>{msg}</h2><div className="pg-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pg-wrap">
      <div className="pg-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="pg-score">Move {state.moves}</div>
      <div className="pg-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`pg-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as PallanguzhiAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
