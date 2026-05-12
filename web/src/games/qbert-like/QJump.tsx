import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QJumpState, QJumpAction, QDir } from "./state.js";
import { LEVELS, isTerminal } from "./state.js";
import "./QJump.css";

const CW = 52; // cube width
const CH = 30; // cube height (isometric)
const PW = LEVELS * CW + 60;
const PH = LEVELS * CH + 80;

function cubeScreenPos(row: number, col: number): { x: number; y: number } {
  // Isometric layout: row increases down, col offsets right
  const x = (LEVELS - 1 - row + col * 2) * (CW / 2) + 30;
  const y = row * CH + 20;
  return { x, y };
}

export function QJump({
  state,
  dispatch,
}: GameProps<QJumpState, Record<never, never>>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as QJumpAction);
        }
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.lost && !state.won) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.lost, state.won, tick]);

  const doJump = useCallback(
    (dir: QDir) => {
      if (!stateRef.current.lost && !stateRef.current.won)
        dispatch({ type: "jump", dir } as QJumpAction);
    },
    [dispatch],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "z" || e.key === "Z") {
        e.preventDefault();
        doJump("dl");
      } else if (e.key === "ArrowRight" || e.key === "x" || e.key === "X") {
        e.preventDefault();
        doJump("dr");
      } else if (e.key === "ArrowUp" || e.key === "q" || e.key === "Q") {
        e.preventDefault();
        doJump("ul");
      } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
        e.preventDefault();
        doJump("ur");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doJump]);

  const terminal = isTerminal(state);
  const { cubes, enemies, playerRow, playerCol, score, lives } = state;

  const colorMap = ["#8B4513", "#e07030", "#30d080"];

  return (
    <div className="qjump-game">
      <div className="qjump-header">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
      </div>

      <div className="qjump-canvas-wrap" style={{ width: PW, height: PH, position: "relative" }}>
        <svg width={PW} height={PH} style={{ display: "block" }}>
          {/* Cubes */}
          {cubes.map((c) => {
            const { x, y } = cubeScreenPos(c.row, c.col);
            const fill = colorMap[c.color] ?? colorMap[0]!;
            // Draw isometric cube face
            const pts = [
              `${x},${y}`,
              `${x + CW / 2},${y + CH / 2}`,
              `${x},${y + CH}`,
              `${x - CW / 2},${y + CH / 2}`,
            ].join(" ");
            return (
              <g key={`${c.row}-${c.col}`}>
                <polygon points={pts} fill={fill} stroke="#333" strokeWidth={1} />
                {/* Top face highlight */}
                <polygon
                  points={[
                    `${x},${y}`,
                    `${x + CW / 2},${y - CH / 4}`,
                    `${x},${y - CH / 2}`,
                    `${x - CW / 2},${y - CH / 4}`,
                  ].join(" ")}
                  fill={fill}
                  stroke="#333"
                  strokeWidth={1}
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* Enemies */}
          {enemies.map((e) => {
            if (!e.alive) return null;
            const { x, y } = cubeScreenPos(e.row, e.col);
            return (
              <circle key={e.id} cx={x} cy={y - CH / 2 - 10} r={10} fill="#e44" stroke="#a00" strokeWidth={2} />
            );
          })}

          {/* Player */}
          {(() => {
            const { x, y } = cubeScreenPos(playerRow, playerCol);
            return (
              <rect
                x={x - 10}
                y={y - CH / 2 - 22}
                width={20}
                height={20}
                rx={4}
                fill="#4af"
                stroke="#069"
                strokeWidth={2}
              />
            );
          })()}
        </svg>

        {terminal && state.won && (
          <div className="qjump-overlay">
            <h2>You Win!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="qjump-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="qjump-controls">
        <span />
        <button title="Jump up-left" onClick={() => doJump("ul")}>↖</button>
        <button title="Jump up-right" onClick={() => doJump("ur")}>↗</button>
        <button title="Jump down-left" onClick={() => doJump("dl")}>↙</button>
        <button title="Jump down-right" onClick={() => doJump("dr")}>↘</button>
        <span />
      </div>

      <div className="qjump-hint">
        Q/↖ · S/↗ · Z/↙ · X/↘ · Color all cubes to win!
      </div>
    </div>
  );
}
