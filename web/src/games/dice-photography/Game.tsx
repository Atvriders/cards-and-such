import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePhotographyState, DicePhotographyAction, DicePhotographySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DicePhotographyGame({ state, dispatch, onGameOver }: GameProps<DicePhotographyState, DicePhotographySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dph-wrap"><div className="dph-done"><h2>Done!</h2><div className="dph-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dph-wrap">
      <div className="dph-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="dph-score">{state.score} pts</div>
      {state.lastRoll > 0 && (
        <>
          <div className="dph-die">{state.lastRoll}</div>
          <div className="dph-result">{state.lastPts > 0 ? `+${state.lastPts}` : "Miss"}</div>
        </>
      )}
      {state.rolls.length > 0 && (
        <div className="dph-row">
          {state.rolls.map((r, i) => <div key={i} className="dph-mini">{r}</div>)}
        </div>
      )}
      <button className="dph-btn" onClick={() => dispatch({ type:"roll" } as DicePhotographyAction)}>Roll Die</button>
    </div>
  );
}
