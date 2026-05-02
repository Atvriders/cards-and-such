import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMountainState, DiceMountainAction, DiceMountainSettings } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";
export function DiceMountainGame({ state, dispatch, onGameOver }: GameProps<DiceMountainState, DiceMountainSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-mountain-theme"><div className="dm-done"><h2>Summit reached!</h2><div>Rolls: {state.rolls}</div><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-mountain-theme">
      <div className="dm-info">Mountain — Altitude {state.altitude} / {TARGET}</div>
      <div className="dm-score">Rolls: {state.rolls}</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "roll" && (
        <button data-testid="hint-target-dice-mountain-roll" className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceMountainAction)}>Climb</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">+{state.lastDelta} altitude</div>
          <button data-testid="hint-target-dice-mountain-next" className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceMountainAction)}>Next</button>
        </>
      )}
    </div>
  );
}
