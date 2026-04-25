import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DotToDotState, DotToDotSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DotToDotGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DotToDotState, DotToDotSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Build line segments between connected dots
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < state.nextDot - 1; i++) {
    const a = state.points.find(p => p.num === i);
    const b = state.points.find(p => p.num === i + 1);
    if (a && b) lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  return (
    <div className="dtd-game">
      <div className="dtd-title">Dot to Dot</div>
      <div className="dtd-hud">
        <span>Next: #{state.nextDot}</span>
        <span>Mistakes: {state.mistakes}</span>
        <span>Progress: {state.nextDot - 1}/{state.totalDots}</span>
      </div>

      <svg className="dtd-canvas" viewBox="0 0 400 400" width="400" height="400">
        {/* Connecting lines */}
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#4daaff" strokeWidth={2} />
        ))}

        {/* Dots */}
        {state.points.map((p) => {
          const connected = p.num < state.nextDot;
          const isNext = p.num === state.nextDot;
          return (
            <g
              key={p.num}
              onClick={() => dispatch({ type: "click-dot", num: p.num })}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isNext ? 12 : 9}
                fill={connected ? "#4daaff" : isNext ? "#ffd700" : "#444"}
                stroke={isNext ? "#fff" : "none"}
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={9}
                fill={connected ? "#000" : "#ccc"}
                pointerEvents="none"
              >
                {p.num}
              </text>
            </g>
          );
        })}
      </svg>

      {state.gameOver && (
        <div className="dtd-complete">
          Picture complete! Score: {terminal?.score}
          {state.mistakes > 0 && <span> ({state.mistakes} mistakes)</span>}
        </div>
      )}
    </div>
  );
}
