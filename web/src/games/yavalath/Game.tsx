import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YavalathState, YavalathAction, YavalathSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function YavalathGame({ state, dispatch, onGameOver }: GameProps<YavalathState, YavalathSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="yv-wrap"><div className="yv-done"><h2>{msg}</h2><div className="yv-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="yv-wrap">
      <div className="yv-info">Place your piece on an empty square. Most pieces wins.</div>
      <div className="yv-score">Move {state.moves}</div>
      <div className="yv-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`yv-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as YavalathAction)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
