import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceToss3State, DiceToss3Action, DiceToss3Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceToss3Game({ state, dispatch, onGameOver }: GameProps<DiceToss3State, DiceToss3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score">{state.score} pts</span></div>
      <p>Toss 3 dice — score the total!</p>
      {state.phase === "waiting" && <button data-testid="hint-target-dice-toss-3-action" className="dm-btn" onClick={() => dispatch({ type:"toss" } as DiceToss3Action)}>Toss!</button>}
      {state.phase === "result" && state.dice && <>
        <div className="dm-dice">{state.dice.map((d,i) => <div key={i} className="dm-die">{d}</div>)}</div>
        <div className="dm-result">Sum: {state.dice.reduce((s,v)=>s+v,0)} → +{state.lastPts} pts</div>
        <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceToss3Action)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
