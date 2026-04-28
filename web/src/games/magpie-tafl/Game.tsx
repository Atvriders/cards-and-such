import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagpieTaflState, MagpieTaflAction, MagpieTaflSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function MagpieTaflGame({ state, dispatch, onGameOver }: GameProps<MagpieTaflState, MagpieTaflSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="mt-wrap"><div className="mt-done"><h2>{msg}</h2><div className="mt-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="mt-wrap">
      <div className="mt-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="mt-score">Move {state.moves}</div>
      <div className="mt-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`mt-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as MagpieTaflAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
