import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PonnukiState, PonnukiAction, PonnukiSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function PonnukiGame({ state, dispatch, onGameOver }: GameProps<PonnukiState, PonnukiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="po-wrap"><div className="po-done"><h2>{msg}</h2><div className="po-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="po-wrap">
      <div className="po-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="po-score">Move {state.moves}</div>
      <div className="po-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`po-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as PonnukiAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
