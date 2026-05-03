import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyMiniState, DiceFrenzyMiniAction, DiceFrenzyMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, NUM_DICE } from "./state.js";
import "./Game.css";

export function DiceFrenzyMiniGame({ state, dispatch, onGameOver }: GameProps<DiceFrenzyMiniState, DiceFrenzyMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dfrm-wrap dfrm-theme"><div className="dfrm-done"><h2>Done!</h2><div className="dfrm-final">{state.score} pts</div></div></div>;
  }
  const sum = state.dice.reduce((acc, v, i) => acc + (state.selected[i] ? v : 0), 0);
  return (
    <div className="dfrm-wrap dfrm-theme">
      <div className="dfrm-info">Round {state.round} / {TOTAL_ROUNDS} — Target: {state.target}</div>
      <div className="dfrm-score">{state.score} pts</div>
      <div className="dfrm-info">Selected sum: {sum}</div>
      <div className="dfrm-grid">
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
        <button data-testid="hint-target-dice-frenzy-mini-primary" className="dfrm-btn" onClick={() => dispatch({ type: "submit" } as DiceFrenzyMiniAction)}>Lock In</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dfrm-feedback">Delta: {state.lastDelta >= 0 ? `+${state.lastDelta}` : state.lastDelta} → +{state.lastPts}</div>
          <button className="dfrm-btn alt" onClick={() => dispatch({ type: "next" } as DiceFrenzyMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
