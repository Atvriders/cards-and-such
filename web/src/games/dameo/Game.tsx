import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DameoState, DameoAction, DameoSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function DameoGame({ state, dispatch, onGameOver }: GameProps<DameoState, DameoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="dm-wrap"><div className="dm-done"><h2>{msg}</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="dm-score">Move {state.moves}</div>
      <div className="dm-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`dm-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as DameoAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
