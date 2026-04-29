import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ToguzKumalak92State, ToguzKumalak92Action, ToguzKumalak92Settings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";
export function ToguzKumalak92Game({ state, dispatch, onGameOver }: GameProps<ToguzKumalak92State, ToguzKumalak92Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return <div className="ab-wrap"><h3>Toguz Kumalak (Kazakh)</h3><div className="ab-done"><h2>{msg}</h2><div className="ab-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ab-wrap">
      <h3>Toguz Kumalak (Kazakh)</h3>
      <div className="ab-info">Place on an empty square. Most pieces wins.</div>
      <div className="ab-score">Move {state.moves}</div>
      <div className="ab-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          return <button key={i} className={`ab-cell ${cls}`} disabled={v !== null} onClick={() => dispatch({ type:"place", idx:i } as ToguzKumalak92Action)}>{v ?? ""}</button>;
        })}
      </div>
    </div>
  );
}
