import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice100TargetState, Dice100TargetAction, Dice100TargetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function Dice100Target({ state, dispatch, onGameOver }: GameProps<Dice100TargetState, Dice100TargetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p>Total Score: <strong>{state.totalScore}</strong></p></div>;
  }

  const isBust = state.phase === "bust";
  const isScored = state.phase === "scored";

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>Total: {state.totalScore}</span></div>
      <div style={{ fontSize: "3rem", fontWeight: 900, color: state.total > 90 ? "#e74c3c" : "#2c3e50" }}>{state.total}</div>
      <p style={{ color: "#888", fontSize: "0.9rem" }}>Running total (target: ≤ 100)</p>
      {state.lastRoll && <div className="dice-row"><span className="die">{PIPS[state.lastRoll]}</span></div>}
      {isBust && <p className="dice-msg" style={{ color: "#e74c3c" }}>Bust! Over 100 — 0 points this round.</p>}
      {isScored && <p className="dice-msg" style={{ color: "#27ae60" }}>Stopped at {state.total} — +{state.total} pts!</p>}
      <div className="dice-actions">
        {state.phase === "rolling" && (
          <>
            <button className="dice-btn" onClick={() => dispatch({ type: "roll" } as Dice100TargetAction)}>Roll Die</button>
            {state.total > 0 && <button className="dice-btn bank" onClick={() => dispatch({ type: "stop" } as Dice100TargetAction)}>Stop & Bank</button>}
          </>
        )}
        {(isBust || isScored) && <button className="dice-btn" onClick={() => dispatch({ type: "next" } as Dice100TargetAction)}>Next Round</button>}
      </div>
    </div>
  );
}
