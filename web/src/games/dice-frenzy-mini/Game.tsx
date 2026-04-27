import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyMiniState, DiceFrenzyMiniAction, DiceFrenzyMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, NUM_DICE } from "./state.js";
import "./Game.css";

export function DiceFrenzyMiniGame({ state, dispatch, onGameOver }: GameProps<DiceFrenzyMiniState, DiceFrenzyMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dfm-wrap"><div className="dfm-done"><h2>Done!</h2><div className="dfm-final">{state.score} pts</div></div></div>;
  }
  const sum = state.dice.reduce((acc, v, i) => acc + (state.selected[i] ? v : 0), 0);
  return (
    <div className="dfm-wrap">
      <div className="dfm-info">Round {state.round} / {TOTAL_ROUNDS} — Target: {state.target}</div>
      <div className="dfm-score">{state.score} pts</div>
      <div className="dfm-info">Selected sum: {sum}</div>
      <div className="dfm-grid">
        {state.dice.map((v, i) => (
          <button
            key={i}
            className={`dfm-die ${state.selected[i] ? "selected" : ""}`}
            disabled={state.phase !== "selecting"}
            onClick={() => dispatch({ type: "toggle", index: i } as DiceFrenzyMiniAction)}
          >{v}</button>
        ))}
      </div>
      {state.phase === "selecting" && (
        <button className="dfm-btn" onClick={() => dispatch({ type: "submit" } as DiceFrenzyMiniAction)}>Lock In</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dfm-feedback">Delta: {state.lastDelta >= 0 ? `+${state.lastDelta}` : state.lastDelta} → +{state.lastPts}</div>
          <button className="dfm-btn alt" onClick={() => dispatch({ type: "next" } as DiceFrenzyMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
