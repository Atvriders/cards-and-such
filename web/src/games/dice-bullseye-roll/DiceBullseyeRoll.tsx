import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBullseyeRollState, DiceBullseyeRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DiceBullseyeRoll.css";

export function DiceBullseyeRoll({ state, dispatch, onGameOver }: GameProps<DiceBullseyeRollState, DiceBullseyeRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const dist = Math.abs(state.total - state.target);
  const hit = dist === 0;
  const pts = hit ? 20 : dist === 1 ? 10 : dist === 2 ? 5 : 0;
  return (
    <div className="dg-wrap">
      <div className="dg-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {!terminal ? (
        <>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:".9rem",color:"#555"}}>Target</div>
            <div className="dg-score-big">{state.target}</div>
          </div>
          <div className="dg-dice">
            {state.dice.map((d, i) => <div key={i} className="dg-die disabled">{d}</div>)}
          </div>
          <div className="dg-result">Total: {state.total} | {hit ? "BULLSEYE! +20" : pts > 0 ? `Close! +${pts}` : "Miss +0"}</div>
          <button className="dg-btn" onClick={() => dispatch({ type: "roll" })}>Next Roll</button>
        </>
      ) : (
        <div className="dg-done"><h2>Game Over!</h2><div className="dg-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}
