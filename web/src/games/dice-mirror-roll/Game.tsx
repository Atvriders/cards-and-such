import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMirrorRollState, DiceMirrorRollAction, DiceMirrorRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceMirrorRoll({ state, dispatch, onGameOver }: GameProps<DiceMirrorRollState, DiceMirrorRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const isReveal = state.phase === "reveal";

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>{state.score} pts</span></div>
      <div className="dice-row">
        <span className="die">{PIPS[state.currentDie]}</span>
        {isReveal && state.nextDie !== null && <span className={`die${state.result === "correct" ? " die-double" : ""}`}>{PIPS[state.nextDie]}</span>}
      </div>
      {!isReveal && <p style={{ color: "#555", fontSize: "0.9rem" }}>Will the next roll be higher, lower, or the same?</p>}
      {!isReveal && (
        <div className="dice-actions">
          <button className="dice-btn bank" onClick={() => dispatch({ type: "bet", call: "higher" } as DiceMirrorRollAction)}>Higher (+25)</button>
          <button className="dice-btn" style={{ background: "#e74c3c" }} onClick={() => dispatch({ type: "bet", call: "lower" } as DiceMirrorRollAction)}>Lower (+25)</button>
          <button className="dice-btn" style={{ background: "#f39c12" }} onClick={() => dispatch({ type: "bet", call: "same" } as DiceMirrorRollAction)}>Same (+60)</button>
        </div>
      )}
      {isReveal && (
        <div>
          <p className="dice-msg" style={{ color: state.result === "correct" ? "#27ae60" : "#e74c3c" }}>
            {state.result === "correct" ? `Correct! +${state.lastPts} pts` : "Wrong! 0 pts"}
          </p>
          <button className="dice-btn" onClick={() => dispatch({ type: "next" } as DiceMirrorRollAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
