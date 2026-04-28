import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GlucksshausState, GlucksshausAction, GlucksshausSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function GlucksshausGame({ state, dispatch, onGameOver }: GameProps<GlucksshausState, GlucksshausSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gh-wrap"><div className="gh-done"><h2>Done!</h2><div className="gh-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="gh-wrap">
      <div className="gh-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="gh-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="gh-row">{state.dice.map((d, i) => <div key={i} className="gh-die">{d}</div>)}</div>}
      {state.message && <div className="gh-result">{state.message}</div>}
      {state.phase === "roll" && <button className="gh-btn" onClick={() => dispatch({ type:"roll" } as GlucksshausAction)}>Roll</button>}
      {state.phase === "result" && <button className="gh-btn alt" onClick={() => dispatch({ type:"next" } as GlucksshausAction)}>Next</button>}
    </div>
  );
}
