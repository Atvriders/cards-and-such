import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BuncoDiceState, BuncoDiceAction, BuncoDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BuncoDiceGame({ state, dispatch, onGameOver }: GameProps<BuncoDiceState, BuncoDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="bu-wrap"><div className="bu-done"><h2>Done!</h2><div className="bu-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bu-wrap">
      <div className="bu-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bu-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="bu-row">{state.dice.map((d, i) => <div key={i} className="bu-die">{d}</div>)}</div>}
      {state.message && <div className="bu-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-bunco-dice-roll" className="bu-btn" onClick={() => dispatch({ type:"roll" } as BuncoDiceAction)}>Roll</button>}
      {state.phase === "result" && <button data-testid="hint-target-bunco-dice-next" className="bu-btn alt" onClick={() => dispatch({ type:"next" } as BuncoDiceAction)}>Next</button>}
    </div>
  );
}
