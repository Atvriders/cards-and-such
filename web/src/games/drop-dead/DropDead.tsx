import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DropDeadState, DropDeadAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./DropDead.css";

type DropDeadSettings = DropDeadState["settings"];

export function DropDead({
  state,
  dispatch,
  onGameOver,
}: GameProps<DropDeadState, DropDeadSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { score, lastRoll, deadIndices, activeDice, phase } = state;

  function dieFace(val: number): string {
    return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val] ?? val.toString();
  }

  return (
    <div className="dropdead">
      <div className="dropdead-score">Score: <span className="dropdead-score-val">{score}</span></div>
      <div className="dropdead-active">Active dice: {activeDice}</div>

      {lastRoll.length > 0 && (
        <div className="dropdead-dice">
          {lastRoll.map((v, i) => (
            <span
              key={i}
              className={`dropdead-die ${deadIndices.includes(i) ? "dead" : "live"}`}
            >
              {dieFace(v)}
            </span>
          ))}
        </div>
      )}

      {lastRoll.length > 0 && (
        <div className="dropdead-msg">
          {deadIndices.length > 0
            ? `${deadIndices.length} die${deadIndices.length > 1 ? "s" : ""} dead (2 or 5) — no score this roll.`
            : `Rolled ${lastRoll.reduce((a, b) => a + b, 0)} — added to score!`}
        </div>
      )}

      {phase === "done" ? (
        <div className="dropdead-win">
          Game over! Final score: <strong>{score}</strong>
        </div>
      ) : (
        <button data-testid="hint-target-drop-dead-roll" className="dropdead-btn" onClick={() => dispatch({ type: "roll" } as DropDeadAction)}>
          Roll {activeDice} {activeDice === 1 ? "Die" : "Dice"}
        </button>
      )}
    </div>
  );
}
