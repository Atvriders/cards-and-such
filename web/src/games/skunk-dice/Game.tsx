import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkunkDiceState, SkunkDiceAction, SkunkDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function SkunkDiceGame({ state, dispatch, onGameOver }: GameProps<SkunkDiceState, SkunkDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="sk-wrap"><div className="sk-done"><h2>Done!</h2><div className="sk-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="sk-wrap">
      <div className="sk-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="sk-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="sk-row">{state.dice.map((d, i) => <div key={i} className="sk-die">{d}</div>)}</div>}
      {state.message && <div className="sk-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-skunk-dice-roll" className="sk-btn" onClick={() => dispatch({ type:"roll" } as SkunkDiceAction)}>Roll</button>}
      {state.phase === "result" && <button data-testid="hint-target-skunk-dice-next" className="sk-btn alt" onClick={() => dispatch({ type:"next" } as SkunkDiceAction)}>Next</button>}
    </div>
  );
}
