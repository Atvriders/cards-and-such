import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrandubhState, BrandubhAction, BrandubhSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function BrandubhGame({ state, dispatch, onGameOver }: GameProps<BrandubhState, BrandubhSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="br-wrap"><div className="br-done"><h2>{msg}</h2><div className="br-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="br-wrap">
      <div className="br-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="br-score">Move {state.moves}</div>
      <div className="br-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`br-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as BrandubhAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
