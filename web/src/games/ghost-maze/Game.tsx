import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GhostMazeState, GhostMazeSettings, Dir } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function GhostMazeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<GhostMazeState, GhostMazeSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) { endedRef.current = true; onGameOver(t.score); }
  }, [state, onGameOver]);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.won || s.caught) { rafRef.current = null; return; }
      if (now - lastTickRef.current >= 200) {
        dispatch({ type: "tick" });
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.won && !state.caught) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [state.won, state.caught, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); dispatch({ type: "move", dir }); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const { rows, cols, hWalls, vWalls, playerRow, playerCol, ghostRow, ghostCol, moves, won, caught } = state;
  const terminal = isTerminal(state);
  const CELL = Math.min(40, Math.floor(480 / Math.max(rows, cols)));
  const W = cols * CELL;
  const H = rows * CELL;
  const idx = (r: number, c: number) => r * cols + c;

  return (
    <div className="ghost-maze-wrap fade-in">
      <div className="ghost-maze-header">
        <span>Moves: {moves}</span>
        <span>Escape the ghost!</span>
      </div>
      <svg width={W + 2} height={H + 2} className="ghost-maze-svg">
        <rect x={0} y={0} width={W + 2} height={H + 2} fill="#08080f" />
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <rect key={`bg-${r}-${c}`}
              x={c * CELL + 1} y={r * CELL + 1}
              width={CELL} height={CELL} fill="#101018"
            />
          )),
        )}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!hWalls[idx(r, c)]) return null;
            return <line key={`h-${r}-${c}`}
              x1={c * CELL + 1} y1={(r + 1) * CELL + 1}
              x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
              stroke="#444488" strokeWidth={2} />;
          }),
        )}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            if (!vWalls[idx(r, c)]) return null;
            return <line key={`v-${r}-${c}`}
              x1={(c + 1) * CELL + 1} y1={r * CELL + 1}
              x2={(c + 1) * CELL + 1} y2={(r + 1) * CELL + 1}
              stroke="#444488" strokeWidth={2} />;
          }),
        )}
        <rect x={1} y={1} width={W} height={H} fill="none" stroke="#444488" strokeWidth={2} />

        {/* Exit */}
        <rect x={(cols - 1) * CELL + 1 + 3} y={(rows - 1) * CELL + 1 + 3}
          width={CELL - 6} height={CELL - 6} fill="#22cc44" rx={3} />
        <text x={(cols - 1) * CELL + 1 + CELL / 2} y={(rows - 1) * CELL + 1 + CELL / 2 + 5}
          textAnchor="middle" fontSize={CELL * 0.45} fill="#000">G</text>

        {/* Ghost */}
        <g>
          <ellipse
            cx={ghostCol * CELL + 1 + CELL / 2}
            cy={ghostRow * CELL + 1 + CELL / 2 - 2}
            rx={CELL / 2 - 4} ry={CELL / 2 - 2}
            fill="#8844ff"
          />
          {/* Ghost eyes */}
          <circle cx={ghostCol * CELL + 1 + CELL / 2 - 4} cy={ghostRow * CELL + 1 + CELL / 2 - 4} r={3} fill="#fff" />
          <circle cx={ghostCol * CELL + 1 + CELL / 2 + 4} cy={ghostRow * CELL + 1 + CELL / 2 - 4} r={3} fill="#fff" />
          <circle cx={ghostCol * CELL + 1 + CELL / 2 - 3} cy={ghostRow * CELL + 1 + CELL / 2 - 3} r={1.5} fill="#000" />
          <circle cx={ghostCol * CELL + 1 + CELL / 2 + 5} cy={ghostRow * CELL + 1 + CELL / 2 - 3} r={1.5} fill="#000" />
        </g>

        {/* Player */}
        <circle
          cx={playerCol * CELL + 1 + CELL / 2}
          cy={playerRow * CELL + 1 + CELL / 2}
          r={CELL / 2 - 4}
          fill="#ffdd00"
        />
      </svg>

      {terminal && (
        <div className="ghost-maze-overlay">
          <h2>{won ? "Escaped!" : "Caught!"}</h2>
          <p>Score: {terminal.score} · Moves: {moves}</p>
        </div>
      )}
      <div className="ghost-maze-hint">Arrow keys or WASD · Reach G before the ghost catches you</div>
    </div>
  );
}
