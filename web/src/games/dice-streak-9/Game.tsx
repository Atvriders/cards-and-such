import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStreak9State, DiceStreak9Action, DiceStreak9Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceStreak9({ state, dispatch, onGameOver }: GameProps<DiceStreak9State, DiceStreak9Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="ds9-wrap"><div className="ds9-done">
      <h2>Game Over!</h2>
      <p>Best Streak: {state.bestStreak}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#d35400" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="ds9-wrap">
      <div className="ds9-header">
        <span>Attempts {state.attempts} / {state.maxAttempts}</span>
        <span className="ds9-score">{state.score} pts</span>
      </div>
      <div className="ds9-info">
        <span>Need: <strong>{state.nextNeeded}</strong></span>
        <span>Streak: <strong>{state.streak}</strong></span>
        <span>Best: <strong>{state.bestStreak}</strong></span>
      </div>
      <div className="ds9-dice">
        {state.dice.map((d, i) => (
          <span key={i} className={`ds9-die ${d === state.nextNeeded && state.lastHit ? "hit" : ""}`}>{FACES[d]}</span>
        ))}
      </div>
      {state.lastHit !== null && (
        <div className={`ds9-feedback ${state.lastHit ? "hit" : "miss"}`}>{state.lastHit ? `Hit! +${10 * state.streak}` : "Miss — streak reset"}</div>
      )}
      <button data-testid="hint-target-dice-streak-9-roll" className="ds9-btn" onClick={() => dispatch({ type: "roll" } as DiceStreak9Action)}>Roll</button>
      <div className="ds9-target">Target streak: {state.target}</div>
    </div>
  );
}
