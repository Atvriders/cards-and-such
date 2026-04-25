import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePyramidRollState, DicePyramidRollAction, DicePyramidRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DicePyramidRoll({ state, dispatch, onGameOver }: GameProps<DicePyramidRollState, DicePyramidRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="dpr-wrap"><div className="dpr-done">
      <h2>Pyramid Complete!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e74c3c" }}>{state.score} pts</p>
    </div></div>
  );

  const currentTarget = state.levelTargets[state.level] ?? 0;
  return (
    <div className="dpr-wrap">
      <div className="dpr-header">
        <span>Level {state.level + 1} / {state.maxLevels}</span>
        <span className="dpr-score">{state.score} pts</span>
      </div>
      <div className="dpr-target">Need die value ≥ <strong>{currentTarget}</strong></div>
      <div className="dpr-dice">
        {state.dice.map((d, i) => (
          <button key={i} className={`dpr-die ${state.usedDice[i] ? "used" : ""} ${state.phase === "assigning" && !state.usedDice[i] ? "pickable" : ""}`}
            disabled={state.usedDice[i] || state.phase !== "assigning"}
            onClick={() => dispatch({ type: "assign", diceIndex: i } as DicePyramidRollAction)}>
            {FACES[d]}
          </button>
        ))}
      </div>
      {state.phase === "scored" && (
        <div className="dpr-feedback">{state.lastLevelPts > 0 ? `Success! +${state.lastLevelPts}` : "Failed! 0 pts"}</div>
      )}
      <div className="dpr-actions">
        {state.phase === "rolling" && <button className="dpr-btn roll" onClick={() => dispatch({ type: "roll" } as DicePyramidRollAction)}>Roll</button>}
        {state.phase === "assigning" && <p className="dpr-hint">Click a die to assign to this level</p>}
        {state.phase === "scored" && <button className="dpr-btn next" onClick={() => dispatch({ type: "next" } as DicePyramidRollAction)}>Next Level</button>}
      </div>
    </div>
  );
}
