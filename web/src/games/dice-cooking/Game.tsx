import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCookingState, DiceCookingAction, DiceCookingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCookingGame({ state, dispatch, onGameOver }: GameProps<DiceCookingState, DiceCookingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dco-wrap"><div className="dco-done bounce-in"><h2>Done!</h2><div className="dco-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dco-wrap fade-in">
      <div className="dco-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="dco-score pulse">{state.score} pts</div>
      {state.lastRoll > 0 && (
        <>
          <div className="dco-die">{state.lastRoll}</div>
          <div className="dco-result">{state.lastPts > 0 ? `+${state.lastPts}` : "Miss"}</div>
        </>
      )}
      {state.rolls.length > 0 && (
        <div className="dco-row">
          {state.rolls.map((r, i) => <div key={i} className="dco-mini">{r}</div>)}
        </div>
      )}
      <button data-testid="hint-target-dice-cooking-roll" className="dco-btn" onClick={() => dispatch({ type:"roll" } as DiceCookingAction)}>Roll Die</button>
    </div>
  );
}
