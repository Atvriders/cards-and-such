import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpinRollState, DiceSpinRollAction, DiceSpinRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceSpinRollGame({ state, dispatch, onGameOver }: GameProps<DiceSpinRollState, DiceSpinRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score">{state.score} pts</span></div>
      <div className="dm-target">Target: {state.target}</div>
      <p>Roll 3 dice — score based on how close the sum is to the target!</p>
      {state.phase === "waiting" && <button className="dm-btn" data-testid="hint-target-dice-spin-roll-roll" onClick={() => dispatch({ type:"spin" } as DiceSpinRollAction)}>Spin!</button>}
      {state.phase === "result" && state.dice && <>
        <div className="dm-dice">{state.dice.map((d,i) => <div key={i} className="dm-die">{d}</div>)}</div>
        <div className="dm-result">Sum: {state.dice.reduce((s,v)=>s+v,0)} (target was {state.target}) → +{state.lastPts} pts</div>
        <button className="dm-btn" data-testid="hint-target-dice-spin-roll-next" onClick={() => dispatch({ type:"next" } as DiceSpinRollAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
