import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DameoFreelingState, DameoFreelingAction, DameoFreelingSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";
export function DameoFreelingGame({ state, dispatch, onGameOver }: GameProps<DameoFreelingState, DameoFreelingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="ab-wrap"><h3>Dameo (Freeling)</h3><div className="ab-done bounce-in"><h2>{msg}</h2><div className="ab-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ab-wrap fade-in">
      <h3>Dameo (Freeling)</h3>
      <div className="ab-info">Place on an empty square. Most pieces wins.</div>
      <div className="ab-score pulse">Move {state.moves}</div>
      <div className="ab-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button title="Select cell" key={i} className={`ab-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as DameoFreelingAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
