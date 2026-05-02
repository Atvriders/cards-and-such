import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGridironState, DiceGridironAction, DiceGridironSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceGridironGame({ state, dispatch, onGameOver }: GameProps<DiceGridironState, DiceGridironSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dgrd-wrap dgrd-theme"><div className="dgrd-done"><h2>Done!</h2><div className="dgrd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dgrd-wrap dgrd-theme">
      <div className="dgrd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dgrd-score">{state.score} pts</div>
      {state.dice && (
        <div className="dgrd-row">{state.dice.map((d, i) => <div key={i} className="dgrd-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dgrd-btn" data-testid="hint-target-dice-gridiron-roll" onClick={() => dispatch({ type:"roll" } as DiceGridironAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dgrd-result">+{state.lastPts}</div>
          <button className="dgrd-btn alt" data-testid="hint-target-dice-gridiron-next" onClick={() => dispatch({ type:"next" } as DiceGridironAction)}>Next</button>
        </>
      )}
    </div>
  );
}
