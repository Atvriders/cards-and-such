import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceAimState, DiceAimAction, DiceAimSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceAimGame({ state, dispatch, onGameOver }: GameProps<DiceAimState, DiceAimSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="daim-wrap daim-theme"><div className="daim-done"><h2>Done!</h2><div className="daim-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="daim-wrap daim-theme">
      <div className="daim-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="daim-score">{state.score} pts</div>
      {state.dice && (
        <div className="daim-row">{state.dice.map((d, i) => <div key={i} className="daim-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-dice-aim-action" className="daim-btn" onClick={() => dispatch({ type:"roll" } as DiceAimAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="daim-result">+{state.lastPts}</div>
          <button className="daim-btn alt" onClick={() => dispatch({ type:"next" } as DiceAimAction)}>Next</button>
        </>
      )}
    </div>
  );
}
