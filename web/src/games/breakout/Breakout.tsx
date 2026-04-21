import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BreakoutState, BreakoutAction } from "./state.js";
import {
  PADDLE_Y,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BRICK_AREA_Y_TOP,
  BRICK_AREA_Y_BOTTOM,
  BRICK_COLS,
  isTerminal,
} from "./state.js";
import "./Breakout.css";

// Fixed pixel dimensions
const PW = 480; // playfield width px
const PH = 640; // playfield height px

type BreakoutSettings = { difficulty: "easy" | "medium" | "hard"; rows: "3" | "5" | "7" };

export function Breakout({
  state,
  dispatch,
}: GameProps<BreakoutState, BreakoutSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // ── rAF tick loop ──────────────────────────────────────────────────────────
  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05); // cap at 50ms
          dispatch({ type: "tick", dt } as BreakoutAction);
        }
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        lastTimeRef.current = null;
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

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        const newX = Math.max(s.paddleWidth / 2, s.paddleX - 0.04);
        dispatch({ type: "move-paddle", x: newX } as BreakoutAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        const newX = Math.min(1 - s.paddleWidth / 2, s.paddleX + 0.04);
        dispatch({ type: "move-paddle", x: newX } as BreakoutAction);
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!s.started && !s.lost && !s.won) {
          // Reset rAF timestamp so we don't get a huge dt spike
          lastTimeRef.current = null;
          dispatch({ type: "release" } as BreakoutAction);
        } else if (s.started && !s.lost && !s.won) {
          dispatch({ type: s.paused ? "resume" : "pause" } as BreakoutAction);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  // ── Mouse / pointer for paddle ─────────────────────────────────────────────
  const playfieldRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      dispatch({ type: "move-paddle", x } as BreakoutAction);
    },
    [dispatch],
  );

  // ── Derived layout values ──────────────────────────────────────────────────
  const { bricks, paddleX, paddleWidth, ballX, ballY, rowsCount, lives, score } = state;
  const terminal = isTerminal(state);

  const paddleLeftPx = (paddleX - paddleWidth / 2) * PW;
  const paddleWidthPx = paddleWidth * PW;
  const paddleTopPx = PADDLE_Y * PH;
  const paddleHeightPx = PADDLE_HEIGHT * PH;

  const ballCxPx = ballX * PW;
  const ballCyPx = ballY * PH;
  const ballRpx = BALL_RADIUS * PH;

  const brickWidth = 1 / BRICK_COLS;
  const brickHeight = (BRICK_AREA_Y_BOTTOM - BRICK_AREA_Y_TOP) / rowsCount;
  const brickWidthPx = brickWidth * PW;
  const brickHeightPx = brickHeight * PH;

  return (
    <div className="breakout-game">
      <div className="breakout-header">
        <span>Score: {score}</span>
        <div className="breakout-lives">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`breakout-life${i >= lives ? " breakout-life--lost" : ""}`}
            />
          ))}
        </div>
        {state.paused && !terminal && <span>PAUSED</span>}
      </div>

      <div
        className="breakout-playfield"
        ref={playfieldRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
      >
        {/* Bricks */}
        {bricks.map((brick) => {
          if (!brick.alive) return null;
          const left = brick.col * brickWidth * PW;
          const top = (BRICK_AREA_Y_TOP + brick.row * brickHeight) * PH;
          return (
            <div
              key={`${brick.row}-${brick.col}`}
              className="breakout-brick"
              style={{
                left,
                top,
                width: brickWidthPx - 2,
                height: brickHeightPx - 2,
                background: brick.color,
              }}
            />
          );
        })}

        {/* Paddle */}
        <div
          className="breakout-paddle"
          style={{
            left: paddleLeftPx,
            top: paddleTopPx,
            width: paddleWidthPx,
            height: paddleHeightPx,
          }}
        />

        {/* Ball */}
        <div
          className="breakout-ball"
          style={{
            left: ballCxPx - ballRpx,
            top: ballCyPx - ballRpx,
            width: ballRpx * 2,
            height: ballRpx * 2,
          }}
        />

        {/* Overlays */}
        {!state.started && !terminal && (
          <div className="breakout-overlay">
            <h2>Breakout</h2>
            <p>Press Space or click to launch</p>
          </div>
        )}

        {state.paused && !terminal && (
          <div className="breakout-overlay">
            <h2>Paused</h2>
            <p>Press Space to resume</p>
          </div>
        )}

        {terminal && state.won && (
          <div className="breakout-overlay">
            <h2>You Win!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}

        {terminal && state.lost && (
          <div className="breakout-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="breakout-controls">
        {state.started && !terminal && (
          <button
            onClick={() =>
              dispatch({ type: state.paused ? "resume" : "pause" } as BreakoutAction)
            }
          >
            {state.paused ? "Resume" : "Pause"}
          </button>
        )}
        {!state.started && !terminal && (
          <button
            onClick={() => {
              lastTimeRef.current = null;
              dispatch({ type: "release" } as BreakoutAction);
            }}
          >
            Launch Ball
          </button>
        )}
      </div>

      <div className="breakout-hint">
        Arrow keys / A-D to move · Mouse to aim · Space to launch/pause
      </div>
    </div>
  );
}
