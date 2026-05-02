import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollASixState, RollASixSettings } from "./state.js";
import { isTerminal, TARGET_SIXES } from "./state.js";
import "./RollASix.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function RollASix({
  state,
  dispatch,
  onGameOver,
}: GameProps<RollASixState, RollASixSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="ras-game">
      <div className="ras-title">Roll a 6</div>

      <div className="ras-stats">
        <div className="ras-stat">
          <span className="ras-stat-label">Sixes</span>
          <span className="ras-stat-value">{state.sixesRolled} / {TARGET_SIXES}</span>
        </div>
        <div className="ras-stat">
          <span className="ras-stat-label">Rolls</span>
          <span className="ras-stat-value">{state.rolls}</span>
        </div>
        <div className="ras-stat">
          <span className="ras-stat-label">Score</span>
          <span className="ras-stat-value">{state.done ? terminal?.score : Math.max(0, 100 - state.rolls)}</span>
        </div>
      </div>

      <div className={`ras-die ${state.lastDie === 6 ? "six" : state.lastDie ? "other" : "empty"}`}>
        {state.lastDie ? DIE_FACES[state.lastDie] : "?"}
      </div>

      {state.lastDie && (
        <div className={`ras-result ${state.lastDie === 6 ? "yes" : "no"}`}>
          {state.lastDie === 6 ? "Six!" : `Rolled ${state.lastDie}`}
        </div>
      )}

      <div className="ras-progress">
        {Array.from({ length: TARGET_SIXES }, (_, i) => (
          <div key={i} className={`ras-pip ${i < state.sixesRolled ? "filled" : "empty"}`} />
        ))}
      </div>

      {!state.done && (
        <button data-testid="hint-target-roll-a-six-roll" className="ras-roll-btn" onClick={() => dispatch({ type: "roll" })}>
          Roll Die
        </button>
      )}

      {state.done && (
        <div className="ras-game-over">
          Done in {state.rolls} rolls!<br />
          <span className="ras-score-label">Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
