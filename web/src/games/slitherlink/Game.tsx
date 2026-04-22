import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlitherlinkState, SlitherlinkSettings } from "./state.js";
import { type SlitherlinkAction, isTerminal } from "./state.js";
import "./Game.css";

const CELL = 52; // pixels per cell
const DOT_R = 4;
const MARGIN = 20;

export function Slitherlink({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlitherlinkState, SlitherlinkSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, hEdges, vEdges, won } = state;
  const { rows, cols } = puzzle;

  const svgW = cols * CELL + MARGIN * 2;
  const svgH = rows * CELL + MARGIN * 2;

  function dot(r: number, c: number) {
    return { x: MARGIN + c * CELL, y: MARGIN + r * CELL };
  }

  const edgeClass = (active: boolean) =>
    `slither-edge${active ? (won ? " win-active" : " active") : ""}`;

  return (
    <div className="slither">
      <div className="slither-title">Slitherlink</div>
      <div className={`slither-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — click edges to draw the loop`}
      </div>
      <div className="slither-grid-wrap">
        <svg className="slither-svg" width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {/* Horizontal edges */}
          {Array.from({ length: rows + 1 }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const idx = r * cols + c;
              const d1 = dot(r, c);
              const d2 = dot(r, c + 1);
              return (
                <line
                  key={`h${idx}`}
                  x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                  className={edgeClass(hEdges[idx]!)}
                  onClick={() => !won && dispatch({ type: "toggleH", idx } satisfies SlitherlinkAction)}
                  data-testid={`hedge-${idx}`}
                />
              );
            })
          )}
          {/* Vertical edges */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols + 1 }, (_, c) => {
              const idx = r * (cols + 1) + c;
              const d1 = dot(r, c);
              const d2 = dot(r + 1, c);
              return (
                <line
                  key={`v${idx}`}
                  x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                  className={edgeClass(vEdges[idx]!)}
                  onClick={() => !won && dispatch({ type: "toggleV", idx } satisfies SlitherlinkAction)}
                  data-testid={`vedge-${idx}`}
                />
              );
            })
          )}
          {/* Clues */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const clue = puzzle.clues[r * cols + c];
              if (clue === null) return null;
              const { x, y } = dot(r, c);
              return (
                <text
                  key={`clue${r}-${c}`}
                  x={x + CELL / 2}
                  y={y + CELL / 2}
                  className="slither-clue"
                >
                  {clue}
                </text>
              );
            })
          )}
          {/* Dots */}
          {Array.from({ length: rows + 1 }, (_, r) =>
            Array.from({ length: cols + 1 }, (_, c) => {
              const { x, y } = dot(r, c);
              return <circle key={`dot${r}-${c}`} cx={x} cy={y} r={DOT_R} className="slither-dot" />;
            })
          )}
        </svg>
      </div>
      <div className="slither-hint">Click any edge segment between dots to toggle it on/off.</div>
    </div>
  );
}
