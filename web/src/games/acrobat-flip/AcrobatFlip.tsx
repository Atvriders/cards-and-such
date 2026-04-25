import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcrobatFlipState, AcrobatFlipSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./AcrobatFlip.css";

export function AcrobatFlip({ state, dispatch, onGameOver }: GameProps<AcrobatFlipState, AcrobatFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Draw target zone arc on SVG
  const target = state.targetAngle;
  const cx = 80, cy = 80, r = 72;
  function arcPoint(angle: number): [number, number] {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  const [p1x, p1y] = arcPoint(target - 25);
  const [p2x, p2y] = arcPoint(target + 25);
  const [q1x, q1y] = arcPoint(target - 10);
  const [q2x, q2y] = arcPoint(target + 10);

  return (
    <div className="acrobat-flip">
      <div className="af-stats">
        <span>Flip: {Math.min(state.flipNum, state.totalFlips)}/{state.totalFlips}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="af-circle-container">
        <div className="af-circle">
          <svg width="160" height="160" style={{ position: "absolute", top: 0, left: 0 }}>
            {/* Good zone */}
            <path
              d={`M ${p1x} ${p1y} A ${r} ${r} 0 0 1 ${p2x} ${p2y} L ${cx} ${cy} Z`}
              fill="rgba(255,235,59,0.4)"
            />
            {/* Perfect zone */}
            <path
              d={`M ${q1x} ${q1y} A ${r} ${r} 0 0 1 ${q2x} ${q2y} L ${cx} ${cy} Z`}
              fill="rgba(76,175,80,0.5)"
            />
          </svg>
          <div
            className="af-arrow"
            style={{ transform: `rotate(${state.angle}deg)` }}
          />
        </div>
      </div>

      <div className="af-message">{state.message}</div>

      <div className="af-history">
        {state.history.map((q, i) => (
          <span key={i} className={`af-hist-item ${q}`}>{q}</span>
        ))}
      </div>

      <div className="af-controls">
        {!state.gameOver && state.quality === null && (
          <>
            <button onClick={() => dispatch({ type: "nextFlip" })}>⏩ Spin</button>
            <button onClick={() => dispatch({ type: "land" })}>🤸 Land!</button>
          </>
        )}
        {!state.gameOver && state.quality !== null && (
          <button onClick={() => dispatch({ type: "nextFlip" })}>▶ Next Flip</button>
        )}
        <button onClick={() => dispatch({ type: "restart" })}>New Show</button>
      </div>
    </div>
  );
}
