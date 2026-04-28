import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DaldosState, DaldosAction, DaldosSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function DaldosGame({ state, dispatch, onGameOver }: GameProps<DaldosState, DaldosSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="dd-wrap"><div className="dd-done"><h2>{msg}</h2><div className="dd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dd-wrap">
      <div className="dd-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="dd-score">Move {state.moves}</div>
      <div className="dd-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`dd-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as DaldosAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
