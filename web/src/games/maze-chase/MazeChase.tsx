import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MazeChaseState, MazeChaseAction, MazeChaseSettings } from "./state.js";
import { MAZE_ROWS, MAZE_COLS, cellIdx, isTerminal } from "./state.js";
import "./MazeChase.css";

const CELL = 32; // px per cell
const PW = MAZE_COLS * CELL;
const PH = MAZE_ROWS * CELL;

export function MazeChase({
  state,
  dispatch,
}: GameProps<MazeChaseState, MazeChaseSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over || s.won) {
        rafRef.current = null;
        return;
      }
      if (now - lastTickRef.current >= 50) {
        dispatch({ type: "tick" } as MazeChaseAction);
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.over && !state.won) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [state.over, state.won, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up", w: "up", W: "up",
        ArrowDown: "down", s: "down", S: "down",
        ArrowLeft: "left", a: "left", A: "left",
        ArrowRight: "right", d: "right", D: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        dispatch({ type: "turn", dir } as MazeChaseAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { cells, playerRow, playerCol, enemies } = state;

  return (
    <div className="maze-game">
      <div className="maze-header">
        <span>Score: {state.score}</span>
        <span>Dots: {state.dotsRemaining}</span>
      </div>

      <div className="maze-board" style={{ width: PW, height: PH }}>
        <svg width={PW} height={PH}>
          {/* Cells */}
          {Array.from({ length: MAZE_ROWS }, (_, r) =>
            Array.from({ length: MAZE_COLS }, (_, c) => {
              const ch = cells[cellIdx(r, c)]!;
              const x = c * CELL;
              const y = r * CELL;
              if (ch === "#") {
                return <rect key={`${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill="#1a3a6a" stroke="#2255aa" strokeWidth={0.5} />;
              }
              if (ch === ".") {
                return (
                  <g key={`${r}-${c}`}>
                    <rect x={x} y={y} width={CELL} height={CELL} fill="#000" />
                    <circle cx={x + CELL / 2} cy={y + CELL / 2} r={3} fill="#ffdd88" />
                  </g>
                );
              }
              return <rect key={`${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill="#000" />;
            }),
          )}

          {/* Player */}
          <circle
            cx={playerCol * CELL + CELL / 2}
            cy={playerRow * CELL + CELL / 2}
            r={CELL / 2 - 3}
            fill="#ffff00"
          />

          {/* Enemies */}
          {enemies.map((enemy) => (
            <g key={enemy.id}>
              <circle
                cx={enemy.col * CELL + CELL / 2}
                cy={enemy.row * CELL + CELL / 2}
                r={CELL / 2 - 3}
                fill={enemy.id === 0 ? "#ff4444" : enemy.id === 1 ? "#ff88ff" : "#44ffff"}
              />
              {/* Eyes */}
              <circle cx={enemy.col * CELL + CELL / 2 - 4} cy={enemy.row * CELL + CELL / 2 - 2} r={3} fill="#fff" />
              <circle cx={enemy.col * CELL + CELL / 2 + 4} cy={enemy.row * CELL + CELL / 2 - 2} r={3} fill="#fff" />
            </g>
          ))}
        </svg>

        {terminal && (
          <div className="maze-overlay">
            <h2>{state.won ? "You Win!" : "Caught!"}</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="maze-hint">Arrow keys or WASD to move · Collect all dots · Avoid enemies</div>
    </div>
  );
}
