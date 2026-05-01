import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HighPointCrapsState, HighPointCrapsAction, HighPointCrapsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function HighPointCrapsGame({ state, dispatch, onGameOver }: GameProps<HighPointCrapsState, HighPointCrapsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="hpcr-wrap hpcr-theme"><div className="hpcr-done"><h2>Done!</h2><div className="hpcr-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="hpcr-wrap hpcr-theme">
      <div className="hpcr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hpcr-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="hpcr-row">{state.dice.map((d, i) => <div key={i} className="hpcr-die">{d}</div>)}</div>}
      {state.message && <div className="hpcr-result">{state.message}</div>}
      {state.phase === "roll" && <button className="hpcr-btn" onClick={() => dispatch({ type:"roll" } as HighPointCrapsAction)}>Roll</button>}
      {state.phase === "result" && <button className="hpcr-btn alt" onClick={() => dispatch({ type:"next" } as HighPointCrapsAction)}>Next</button>}
    </div>
  );
}
