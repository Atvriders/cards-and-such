import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BowlingState, BowlingAction, BowlingSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Bowling.css";

// Pin layout: rows of 4-3-2-1 (back to front)
const PIN_POSITIONS = [
  [0, 1, 2, 3], // row 4 (back)
  [4, 5, 6],
  [7, 8],
  [9],           // front pin
];

function rollLabel(knocked: number, pinsUp: number, rollIdx: number, frameLen: number): string {
  if (knocked === 10 && rollIdx === 0) return "X";
  if (rollIdx > 0 && knocked === pinsUp) return "/";
  return String(knocked);
}

export function Bowling({
  state,
  dispatch,
  onGameOver,
}: GameProps<BowlingState, BowlingSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [angle, setAngle] = useState(0.5);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = state.gameOver;

  // Build pin display: show pinsUp of 10 as "up"
  const pinsUpArr = Array.from({ length: 10 }, (_, i) => i < state.pinsUp);

  return (
    <div className="bowling-game fade-in">
      <div className="bowling-title">Bowling</div>
      <div className="bowling-total pulse">Score: {state.totalScore}</div>

      {/* Scoreboard */}
      <div className="bowling-scoreboard">
        <table>
          <thead>
            <tr>
              {state.frames.map((_, i) => (
                <th key={i} className={i === state.currentFrame ? "active" : ""}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {state.frames.map((frame, i) => (
                <td key={i} className={i === state.currentFrame ? "active" : ""}>
                  <div className="bowling-rolls-row">
                    {frame.rolls.map((r, ri) => {
                      let label: string;
                      if (ri === 0 && r === 10) label = "X";
                      else if (ri > 0 && frame.rolls[ri - 1]! + r === 10 && i < 9) label = "/";
                      else label = String(r);
                      return <span key={ri}>{label}</span>;
                    })}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {frame.score !== null ? frame.score : "—"}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lane */}
      <div className="bowling-lane">
        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
          Frame {state.currentFrame + 1} — Roll {state.rollInFrame + 1} — {state.pinsUp} pins up
        </div>

        {/* Pins */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {PIN_POSITIONS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 4 }}>
              {row.map((pinIdx) => (
                <div key={pinIdx} className={`bowling-pin ${pinsUpArr[pinIdx] ? "up" : "down"}`}>
                  {pinsUpArr[pinIdx] ? "●" : "○"}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Aim */}
        {!gameOver && (
          <div className="bowling-aim-section">
            <div className="bowling-aim-label">Aim: {Math.round((angle - 0.5) * 200)}% {angle > 0.5 ? "right" : angle < 0.5 ? "left" : "center"}</div>
            <input
              type="range"
              className="bowling-aim-slider"
              min={0}
              max={1}
              step={0.01}
              value={angle}
              onChange={(e) => setAngle(parseFloat(e.target.value))}
            />
          </div>
        )}

        {state.lastKnocked > 0 && (
          <div className="bowling-last-result">
            Knocked: {state.lastKnocked}
            {state.lastKnocked === 10 && state.rollInFrame === 1 ? " — STRIKE!" :
             state.pinsUp === 0 && state.rollInFrame > 0 ? " — SPARE!" : ""}
          </div>
        )}

        {!gameOver && (
          <div className="bowling-action">
            <button data-testid="hint-target-bowling-action" onClick={() => dispatch({ type: "roll", angle })}>Roll!</button>
          </div>
        )}
      </div>

      {gameOver && (
        <div className="bowling-game-over">
          Game Over!
          <br />
          Final Score: {state.totalScore}
          {state.totalScore === 300 && " — PERFECT GAME!"}
        </div>
      )}
    </div>
  );
}
