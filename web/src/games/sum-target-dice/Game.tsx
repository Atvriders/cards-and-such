import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SumTargetState, SumTargetAction, SumTargetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SumTargetDice({ state, dispatch, onGameOver }: GameProps<SumTargetState, SumTargetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.totalScore} pts</p></div>;
  }

  const sum = state.dice[0] + state.dice[1] + state.dice[2];
  const diff = Math.abs(sum - state.target);
  const pts = diff === 0 ? 50 : Math.max(0, 30 - diff * 5);

  return (
    <div className="dice-wrap fade-in">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>Total: {state.totalScore}</span></div>
      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#3498db" }}>Target: {state.target}</div>
      <div className="dice-row">
        {state.dice.map((d, i) => (
          <button title="Toggle die" key={i} className={`die${state.held[i] ? " die-double" : ""}`}
            style={{ cursor: state.rerollsLeft > 0 && state.phase === "rolling" ? "pointer" : "default" }}
            onClick={() => dispatch({ type: "toggleHold", idx: i as 0 | 1 | 2 } as SumTargetAction)}>{d}</button>
        ))}
      </div>
      <p className="dice-msg">Sum: {sum} | Would score: <strong>{pts} pts</strong></p>
      {state.phase === "scored" && <p className="dice-msg" style={{ color: "#27ae60" }}>Scored {state.roundScore} pts this round!</p>}
      <div className="dice-actions">
        {state.phase === "rolling" && state.rerollsLeft > 0 && (
          <button className="dice-btn" onClick={() => dispatch({ type: "roll" } as SumTargetAction)}>Re-roll ({state.rerollsLeft} left)</button>
        )}
        {state.phase === "rolling" && (
          <button data-testid="hint-target-sum-target-dice-score" className="dice-btn bank" onClick={() => dispatch({ type: "score" } as SumTargetAction)}>Score {pts} pts</button>
        )}
        {state.phase === "scored" && (
          <button data-testid="hint-target-sum-target-dice-next" className="dice-btn" onClick={() => dispatch({ type: "next" } as SumTargetAction)}>Next Round</button>
        )}
      </div>
    </div>
  );
}
