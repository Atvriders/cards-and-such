import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePipAddState, DicePipAddAction, DicePipAddSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DicePipAdd({ state, dispatch, onGameOver }: GameProps<DicePipAddState, DicePipAddSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p>Total Score: <strong>{state.totalScore}</strong></p></div>;
  }

  const isResult = state.phase === "result";
  const currentDie = state.dice[state.diceIdx] ?? null;

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>{state.totalScore} pts</span></div>
      <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#3498db" }}>Target: {state.target}</p>
      <div className="dice-row">
        {state.dice.map((d, i) => (
          <span key={i} className="die" style={{ opacity: i < state.diceIdx ? 0.4 : i === state.diceIdx ? 1 : 0.7 }}>{PIPS[d]}</span>
        ))}
      </div>
      <p style={{ fontSize: "1rem" }}>Running total: <strong>{state.running}</strong></p>
      {!isResult && currentDie !== null && state.diceIdx < 3 && (
        <>
          <p style={{ color: "#555", fontSize: "0.9rem" }}>Die {state.diceIdx + 1} of 3: <strong>{currentDie}</strong> — Add or Skip?</p>
          <div className="dice-actions">
            <button data-testid="hint-target-dice-pip-add-roll" className="dice-btn bank" onClick={() => dispatch({ type: "add" } as DicePipAddAction)}>Add {currentDie}</button>
            <button className="dice-btn" onClick={() => dispatch({ type: "skip" } as DicePipAddAction)}>Skip</button>
          </div>
        </>
      )}
      {isResult && (
        <div>
          <p className="dice-msg" style={{ color: state.roundScore > 0 ? "#27ae60" : "#e74c3c" }}>
            Final: {state.running} | {state.roundScore > 0 ? `+${state.roundScore} pts!` : "Miss — 0 pts"}
          </p>
          <button data-testid="hint-target-dice-pip-add-next" className="dice-btn" onClick={() => dispatch({ type: "next" } as DicePipAddAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
