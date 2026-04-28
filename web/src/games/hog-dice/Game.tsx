import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HogDiceState, HogDiceAction, HogDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function HogDiceGame({ state, dispatch, onGameOver }: GameProps<HogDiceState, HogDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="hg-wrap"><div className="hg-done"><h2>Done!</h2><div className="hg-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="hg-wrap">
      <div className="hg-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hg-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="hg-row">{state.dice.map((d, i) => <div key={i} className="hg-die">{d}</div>)}</div>}
      {state.message && <div className="hg-result">{state.message}</div>}
      {state.phase === "roll" && <button className="hg-btn" onClick={() => dispatch({ type:"roll" } as HogDiceAction)}>Roll</button>}
      {state.phase === "result" && <button className="hg-btn alt" onClick={() => dispatch({ type:"next" } as HogDiceAction)}>Next</button>}
    </div>
  );
}
