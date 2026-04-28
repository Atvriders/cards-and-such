import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleYahtzeeState, TripleYahtzeeAction, TripleYahtzeeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function TripleYahtzeeGame({ state, dispatch, onGameOver }: GameProps<TripleYahtzeeState, TripleYahtzeeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ty-wrap"><div className="ty-done"><h2>Done!</h2><div className="ty-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ty-wrap">
      <div className="ty-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ty-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="ty-row">{state.dice.map((d, i) => <div key={i} className="ty-die">{d}</div>)}</div>}
      {state.message && <div className="ty-result">{state.message}</div>}
      {state.phase === "roll" && <button className="ty-btn" onClick={() => dispatch({ type:"roll" } as TripleYahtzeeAction)}>Roll</button>}
      {state.phase === "result" && <button className="ty-btn alt" onClick={() => dispatch({ type:"next" } as TripleYahtzeeAction)}>Next</button>}
    </div>
  );
}
