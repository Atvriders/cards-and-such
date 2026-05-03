import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFlushRollState, DiceFlushRollSettings } from "./state.js";
import { isTerminal, scoreFlush } from "./state.js";
import "./DiceFlushRoll.css";

export function DiceFlushRoll({ state, dispatch, onGameOver }: GameProps<DiceFlushRollState, DiceFlushRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const pts = scoreFlush(state.dice);
  return (
    <div className="dg-wrap">
      <div className="dg-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span><span>Rerolls: {state.rollsLeft}</span></div>
      {!terminal ? (
        <>
          <p style={{margin:0,color:"#555",fontSize:".9rem"}}>Click dice to keep, reroll the rest. Match as many as possible!</p>
          <div className="dg-dice">
            {state.dice.map((d, i) => (
              <div key={i} className={`dg-die${state.kept[i] ? " selected" : ""}`} onClick={() => dispatch({ type: "toggleKeep", index: i })}>{d}</div>
            ))}
          </div>
          <div className="dg-result">Current: {pts > 0 ? `+${pts}` : "No match"}</div>
          <div style={{display:"flex",gap:12}}>
            {state.rollsLeft > 0 && <button className="dg-btn" onClick={() => dispatch({ type: "reroll" })} data-testid="hint-target-diceflushroll-reroll">Reroll</button>}
            <button className="dg-btn" style={{background:"#28a745"}} onClick={() => dispatch({ type: "score" })} data-testid="hint-target-diceflushroll-score">Score (+{pts})</button>
          </div>
        </>
      ) : (
        <div className="dg-done"><h2>Game Over!</h2><div className="dg-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}
