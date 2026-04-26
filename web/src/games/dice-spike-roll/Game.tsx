import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpikeRollState, DiceSpikeRollAction, DiceSpikeRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceSpikeRollGame({ state, dispatch, onGameOver }: GameProps<DiceSpikeRollState, DiceSpikeRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score">{state.score} pts</span></div>
      <p>Roll 2 dice — pairs double, double-6 triples!</p>
      {state.phase === "waiting" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceSpikeRollAction)}>Roll!</button>}
      {state.phase === "result" && state.dice && <>
        <div className="dm-dice">{state.dice.map((d,i) => <div key={i} className="dm-die">{d}</div>)}</div>
        <div className="dm-result">
          {state.lastMulti === 3 ? "SPIKE! 3x!" : state.lastMulti === 2 ? "Pair! 2x!" : "Normal"} → +{state.lastPts} pts
        </div>
        <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceSpikeRollAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
