import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSequence3State, DiceSequence3Settings } from "./state.js";
import { isTerminal, checkSequence } from "./state.js";
import "./DiceSequence3.css";

export function DiceSequence3({ state, dispatch, onGameOver }: GameProps<DiceSequence3State, DiceSequence3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const seq = checkSequence(state.dice);
  return (
    <div className="dg-wrap">
      <div className="dg-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {!terminal ? (
        <>
          <p style={{margin:0,color:"#555",fontSize:".9rem"}}>Three consecutive numbers = Sequence (30pts)</p>
          <div className="dg-dice">
            {[...state.dice].sort((a,b)=>a-b).map((d, i) => <div key={i} className={`dg-die disabled${seq ? " selected" : ""}`}>{d}</div>)}
          </div>
          {state.lastResult && <div className="dg-result">{state.lastResult}</div>}
          <button data-testid="hint-target-dice-sequence-3-roll" className="dg-btn" onClick={() => dispatch({ type: "roll" })}>Roll</button>
        </>
      ) : (
        <div className="dg-done"><h2>Game Over!</h2><div className="dg-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}
