import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlidePuzzle3x3State, SlidePuzzle3x3Action, SlidePuzzle3x3Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function SlidePuzzle3x3Game({ state, dispatch, onGameOver }: GameProps<SlidePuzzle3x3State, SlidePuzzle3x3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="sp3-wrap"><div className="sp3-done"><h2>Solved!</h2><div>Moves: {state.moves}</div><div className="sp3-final">{t?.score} pts</div><button className="sp3-btn" onClick={() => dispatch({ type:"reset" } as SlidePuzzle3x3Action)}>Play Again</button></div></div>;
  }
  return (
    <div className="sp3-wrap">
      <div className="sp3-header"><span>Moves: {state.moves}</span></div>
      <div className="sp3-grid">
        {state.tiles.map((v, i) => (
          <button key={i} className={`sp3-tile${v === 0 ? " blank" : ""}`} onClick={() => dispatch({ type:"slide", index:i } as SlidePuzzle3x3Action)} disabled={v === 0}>{v === 0 ? "" : v}</button>
        ))}
      </div>
    </div>
  );
}
