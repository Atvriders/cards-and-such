import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PongState, PongAction, PongSettings } from "./state.js";
import {
  isTerminal,
  PADDLE_HALF,
  PADDLE_WIDTH,
  BALL_RADIUS,
  PLAYER_X,
  BOT_X,
} from "./state.js";
import "./Pong.css";

const PW = 480;
const PH = 480;

export function Pong({
  state,
  dispatch,
}: GameProps<PongState, PongSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // ── rAF loop ──────────────────────────────────────────────────────────────
  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.over) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as PongAction);
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
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.over, tick]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const keys = new Set<string>();

    function onKeyDown(e: KeyboardEvent) {
      const s = stateRef.current;
      if (!s.started && !s.over) {
        dispatch({ type: "start" } as PongAction);
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        keys.add("up");
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        keys.add("down");
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.delete("up");
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.delete("down");
    }

    // Poll keys each rAF
    let frameId: number;
    function keyLoop() {
      const s = stateRef.current;
      if (keys.has("up")) {
        dispatch({ type: "move", y: Math.max(PADDLE_HALF, s.playerY - 0.022) } as PongAction);
      }
      if (keys.has("down")) {
        dispatch({ type: "move", y: Math.min(1 - PADDLE_HALF, s.playerY + 0.022) } as PongAction);
      }
      frameId = requestAnimationFrame(keyLoop);
    }
    frameId = requestAnimationFrame(keyLoop);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  // ── Mouse ─────────────────────────────────────────────────────────────────
  const playfieldRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const y = (e.clientY - rect.top) / rect.height;
      dispatch({ type: "move", y } as PongAction);
      if (!stateRef.current.started && !stateRef.current.over) {
        dispatch({ type: "start" } as PongAction);
      }
    },
    [dispatch],
  );

  const terminal = isTerminal(state);

  // ── Layout helpers ────────────────────────────────────────────────────────
  const paddleHeightPx = PADDLE_HALF * 2 * PH;
  const paddleWidthPx = PADDLE_WIDTH * PW;
  const ballSizePx = BALL_RADIUS * 2 * PH;

  function paddleStyle(cx: number, cy: number): React.CSSProperties {
    return {
      left: (cx - PADDLE_WIDTH / 2) * PW,
      top: (cy - PADDLE_HALF) * PH,
      width: paddleWidthPx,
      height: paddleHeightPx,
    };
  }

  return (
    <div className="pong-game">
      <div className="pong-header">
        <span>
          <span className="pong-label">You </span>
          {state.playerScore}
        </span>
        <span>
          {state.botScore}
          <span className="pong-label"> Bot</span>
        </span>
      </div>

      <div
        className="pong-playfield"
        ref={playfieldRef}
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
        onClick={() => {
          if (!state.started && !state.over) dispatch({ type: "start" } as PongAction);
        }}
      >
        <div className="pong-center-line" />

        {/* Player paddle */}
        <div className="pong-paddle" style={paddleStyle(PLAYER_X, state.playerY)} />

        {/* Bot paddle */}
        <div className="pong-paddle" style={paddleStyle(BOT_X, state.botY)} />

        {/* Ball */}
        <div
          className="pong-ball"
          style={{
            left: state.ballX * PW - ballSizePx / 2,
            top: state.ballY * PH - ballSizePx / 2,
            width: ballSizePx,
            height: ballSizePx,
          }}
        />

        {!state.started && !state.over && (
          <div className="pong-overlay">
            <h2>Pong</h2>
            <p>First to {state.targetScore} wins</p>
            <p>Move mouse or press W/S to start</p>
          </div>
        )}

        {terminal && (
          <div className="pong-overlay">
            <h2>{state.winner === "player" ? "You Win!" : "Bot Wins"}</h2>
            <p>
              {state.playerScore} – {state.botScore}
            </p>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="pong-controls" />

      <div className="pong-hint">
        W / S or Arrow keys or mouse to move paddle
      </div>
    </div>
  );
}
