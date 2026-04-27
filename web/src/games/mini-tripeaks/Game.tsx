import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniTripeaksState, MiniTripeaksAction, MiniTripeaksSettings } from "./state.js";
import { isTerminal, cardName, MAX_CLICKS } from "./state.js";
import "./Game.css";

export function MiniTripeaksGame({ state, dispatch, onGameOver }: GameProps<MiniTripeaksState, MiniTripeaksSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="sol-wrap"><div className="sol-done"><h2>Done!</h2><div>Removed: {state.removed}</div><div className="sol-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="sol-wrap">
      <div className="sol-header">
        <span className="sol-info">Removed: {state.removed}</span>
        <span className="sol-info">Clicks: {state.clicks} / {MAX_CLICKS}</span>
        <span className="sol-score">{state.score} pts</span>
      </div>
      <div className="sol-board">
        {state.layout.map((c, i) => (
          <button key={i} className="sol-card" onClick={() => dispatch({ type: "remove", index: i } as MiniTripeaksAction)}>
            {cardName(c)}
          </button>
        ))}
      </div>
    </div>
  );
}
