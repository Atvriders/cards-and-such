import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PigTwoDiceState, PigTwoDiceAction, PigTwoDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PigTwoDiceGame({ state, dispatch, onGameOver }: GameProps<PigTwoDiceState, PigTwoDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="p2-wrap"><div className="p2-done"><h2>Done!</h2><div className="p2-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="p2-wrap">
      <div className="p2-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="p2-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="p2-row">{state.dice.map((d, i) => <div key={i} className="p2-die">{d}</div>)}</div>}
      {state.message && <div className="p2-result">{state.message}</div>}
      {state.phase === "roll" && <button className="p2-btn" onClick={() => dispatch({ type:"roll" } as PigTwoDiceAction)}>Roll</button>}
      {state.phase === "result" && <button className="p2-btn alt" onClick={() => dispatch({ type:"next" } as PigTwoDiceAction)}>Next</button>}
    </div>
  );
}
