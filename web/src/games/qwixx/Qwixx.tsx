import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxState, QwixxAction, Color } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import "./Qwixx.css";

type QwixxSettings = QwixxState["settings"];

const COLORS: Color[] = ["red", "yellow", "blue", "green"];

const ROW_VALUES: Record<Color, readonly number[]> = {
  red:    [2,3,4,5,6,7,8,9,10,11,12],
  yellow: [2,3,4,5,6,7,8,9,10,11,12],
  blue:   [12,11,10,9,8,7,6,5,4,3,2],
  green:  [12,11,10,9,8,7,6,5,4,3,2],
};

function rightmostChecked(checked: boolean[]): number {
  for (let i = checked.length - 1; i >= 0; i--) {
    if (checked[i]) return i;
  }
  return -1;
}

export function Qwixx({
  state,
  dispatch,
  onGameOver,
}: GameProps<QwixxState, QwixxSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { whiteDice, colorDice, checked, locked, penalties, phase } = state;
  const whiteSum = whiteDice[0] + whiteDice[1];

  function isWhiteMarkable(color: Color, index: number): boolean {
    if (phase !== "rolled" || locked[color]) return false;
    const vals = ROW_VALUES[color];
    if (vals[index] !== whiteSum) return false;
    const last = rightmostChecked([...checked[color]]);
    return index > last && !checked[color][index];
  }

  function isColorMarkable(color: Color, index: number): boolean {
    if (phase !== "rolled" || locked[color]) return false;
    const vals = ROW_VALUES[color];
    const cv = colorDice[color];
    const s1 = whiteDice[0] + cv;
    const s2 = whiteDice[1] + cv;
    if (vals[index] !== s1 && vals[index] !== s2) return false;
    const last = rightmostChecked([...checked[color]]);
    return index > last && !checked[color][index];
  }

  return (
    <div className="qwixx">
      <div className="qwixx-score-bar">
        Score: <strong>{calcScore(state)}</strong>
        <span className="qwixx-penalties">
          Penalties: {"✕".repeat(penalties)}{"○".repeat(Math.max(0, 4 - penalties))}
        </span>
      </div>

      {phase === "rolled" && (
        <div className="qwixx-dice-row">
          <span className="qwixx-die white">W:{whiteDice[0]}</span>
          <span className="qwixx-die white">W:{whiteDice[1]}</span>
          <span className="qwixx-die red">R:{colorDice.red}</span>
          <span className="qwixx-die yellow">Y:{colorDice.yellow}</span>
          <span className="qwixx-die blue">B:{colorDice.blue}</span>
          <span className="qwixx-die green">G:{colorDice.green}</span>
        </div>
      )}

      <div className="qwixx-rows">
        {COLORS.map((color) => (
          <div key={color} className={`qwixx-row qwixx-row-${color} ${locked[color] ? "locked" : ""}`}>
            {ROW_VALUES[color].map((val, i) => (
              <button
                key={i}
                className={`qwixx-cell ${checked[color][i] ? "checked" : ""} ${isWhiteMarkable(color, i) ? "white-markable" : ""} ${isColorMarkable(color, i) ? "color-markable" : ""}`}
                onClick={() => {
                  if (isColorMarkable(color, i)) {
                    dispatch({ type: "markColor", color, index: i } as QwixxAction);
                  } else if (isWhiteMarkable(color, i)) {
                    dispatch({ type: "markWhite", color, index: i } as QwixxAction);
                  }
                }}
                disabled={!isWhiteMarkable(color, i) && !isColorMarkable(color, i)}
                title={isColorMarkable(color, i) ? "Mark with color die" : isWhiteMarkable(color, i) ? "Mark with white dice sum" : ""}
              >
                {checked[color][i] ? "✓" : val}
              </button>
            ))}
            {locked[color] && <span className="qwixx-lock">🔒</span>}
          </div>
        ))}
      </div>

      {phase === "done" && (
        <div className="qwixx-gameover">
          Game over! Score: <strong>{calcScore(state)}</strong>
        </div>
      )}

      <div className="qwixx-controls">
        {phase === "preRoll" && (
          <button className="qwixx-btn" onClick={() => dispatch({ type: "roll" } as QwixxAction)}>
            Roll Dice
          </button>
        )}
        {phase === "rolled" && (
          <button className="qwixx-btn penalty-btn" onClick={() => dispatch({ type: "takePenalty" } as QwixxAction)}>
            Take Penalty (skip turn)
          </button>
        )}
      </div>

      {phase === "rolled" && (
        <div className="qwixx-hint">
          White sum: <strong>{whiteSum}</strong> — Click highlighted cells to mark. Color cells use white+color die sum.
        </div>
      )}
    </div>
  );
}
