import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePaintingState, DicePaintingAction, DicePaintingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePaintingGame({ state, dispatch, onGameOver }: GameProps<DicePaintingState, DicePaintingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dpa-wrap"><div className="dpa-done bounce-in"><h2>Done!</h2><div className="dpa-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dpa-wrap fade-in">
      <div className="dpa-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="dpa-score pulse">{state.score} pts</div>
      {state.lastRoll > 0 && (
        <>
          <div className="dpa-die">{state.lastRoll}</div>
          <div className="dpa-result">{state.lastPts > 0 ? `+${state.lastPts}` : "Miss"}</div>
        </>
      )}
      {state.rolls.length > 0 && (
        <div className="dpa-row">
          {state.rolls.map((r, i) => <div key={i} className="dpa-mini">{r}</div>)}
        </div>
      )}
      <button data-testid="hint-target-dice-painting-roll" className="dpa-btn" onClick={() => dispatch({ type:"roll" } as DicePaintingAction)}>Roll Die</button>
    </div>
  );
}
