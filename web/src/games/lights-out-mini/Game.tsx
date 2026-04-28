import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightsOutMiniState, LightsOutMiniAction, LightsOutMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function LightsOutMiniGame({ state, dispatch, onGameOver }: GameProps<LightsOutMiniState, LightsOutMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="lo-wrap"><div className="lo-done"><h2>All Off!</h2><div>Moves: {state.moves}</div><div className="lo-final">{t?.score} pts</div><button className="lo-btn" onClick={() => dispatch({ type:"reset" } as LightsOutMiniAction)}>Play Again</button></div></div>;
  }
  return (
    <div className="lo-wrap">
      <div className="lo-header">Moves: {state.moves}</div>
      <div className="lo-grid">
        {state.cells.map((on, i) => (
          <button key={i} className={`lo-cell${on ? " on" : ""}`} onClick={() => dispatch({ type:"tap", index:i } as LightsOutMiniAction)} aria-label={on ? "on" : "off"} />
        ))}
      </div>
    </div>
  );
}
