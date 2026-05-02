import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePyramidStackState, DicePyramidStackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DicePyramidStack.css";

export function DicePyramidStack({ state, dispatch, onGameOver }: GameProps<DicePyramidStackState, DicePyramidStackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  return (
    <div className="dg-wrap">
      <div className="dg-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {!terminal ? (
        <>
          <p style={{margin:0,color:"#555",fontSize:".9rem"}}>Click a die to bank it for a row bonus, then roll next.</p>
          <div className="dg-dice">
            {state.dice.map((d, i) => (
              <div key={i} className="dg-die" onClick={() => dispatch({ type: "bank", index: i })}>{d}</div>
            ))}
          </div>
          <div className="dg-result">Pyramid rows: {state.pyramid.length}</div>
          <button data-testid="hint-target-dice-pyramid-stack-roll" className="dg-btn" onClick={() => dispatch({ type: "roll" })}>Roll Next</button>
        </>
      ) : (
        <div className="dg-done"><h2>Game Over!</h2><div className="dg-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}
