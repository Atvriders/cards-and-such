import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BouncerState, BouncerAction, BouncerSettings } from "./state.js";
import { PADDLE_Y, PADDLE_H, BALL_R, isTerminal } from "./state.js";
import "./Bouncer.css";

const PW = 480;
const PH = 600;

const POWER_UP_COLORS: Record<string, string> = {
  multiball: "#44ff88",
  slow: "#4488ff",
  wide: "#ffaa22",
};

export function Bouncer({
  state,
  dispatch,
}: GameProps<BouncerState, BouncerSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const playfieldRef = useRef<HTMLDivElement | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastTimeRef.current = null; return; }
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as BouncerAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "movePaddle", x: Math.max(0, s.paddleX - 0.05) } as BouncerAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "movePaddle", x: Math.min(1, s.paddleX + 0.05) } as BouncerAction);
      } else if (e.key === " ") {
        e.preventDefault();
        if (!s.started) dispatch({ type: "release" } as BouncerAction);
        else dispatch({ type: s.paused ? "resume" : "pause" } as BouncerAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = playfieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      dispatch({ type: "movePaddle", x } as BouncerAction);
    },
    [dispatch],
  );

  const terminal = isTerminal(state);

  const paddleLeftPx = (state.paddleX - state.paddleWidth / 2) * PW;
  const paddleWidthPx = state.paddleWidth * PW;

  return (
    <div className="bouncer-game">
      <div className="bouncer-header">
        <span>Score: {state.score}</span>
        <div className="bouncer-lives">
          {Array.from({ length: parseInt(state.settings.lives, 10) }, (_, i) => (
            <span
              key={i}
              className={`bouncer-life${i >= state.lives ? " bouncer-life--lost" : ""}`}
            />
          ))}
        </div>
        {state.slowTicks > 0 && <span style={{ color: "#4488ff" }}>SLOW</span>}
        {state.wideTicks > 0 && <span style={{ color: "#ffaa22" }}>WIDE</span>}
      </div>

      <div
        ref={playfieldRef}
        className="bouncer-playfield"
        style={{ width: PW, height: PH }}
        onPointerMove={onPointerMove}
      >
        {/* Paddle */}
        <div
          style={{
            position: "absolute",
            left: paddleLeftPx,
            top: PADDLE_Y * PH,
            width: paddleWidthPx,
            height: PADDLE_H * PH,
            background: "#ccc",
            borderRadius: 4,
            boxShadow: "0 0 6px rgba(255,255,255,0.4)",
          }}
        />

        {/* Balls */}
        {state.balls.map((ball) => (
          <div
            key={ball.id}
            style={{
              position: "absolute",
              left: ball.x * PW - BALL_R * PW,
              top: ball.y * PH - BALL_R * PH,
              width: BALL_R * 2 * PW,
              height: BALL_R * 2 * PH,
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
          />
        ))}

        {/* Power-ups */}
        {state.powerUps.map((pu) => (
          <div
            key={pu.id}
            style={{
              position: "absolute",
              left: pu.x * PW - 12,
              top: pu.y * PH - 8,
              width: 24,
              height: 16,
              background: POWER_UP_COLORS[pu.type] ?? "#fff",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: "bold",
              color: "#000",
            }}
          >
            {pu.type === "multiball" ? "2x" : pu.type === "slow" ? "SLO" : "WDE"}
          </div>
        ))}

        {/* Overlays */}
        {!state.started && !terminal && (
          <div className="bouncer-overlay">
            <h2>Bouncer</h2>
            <p>Move paddle into position, then press Space</p>
          </div>
        )}
        {state.paused && !terminal && (
          <div className="bouncer-overlay">
            <h2>Paused</h2>
          </div>
        )}
        {terminal && (
          <div className="bouncer-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="bouncer-controls">
        {!state.started && !terminal && (
          <button onClick={() => { lastTimeRef.current = null; dispatch({ type: "release" } as BouncerAction); }}>
            Launch
          </button>
        )}
        {state.started && !terminal && (
          <button onClick={() => dispatch({ type: state.paused ? "resume" : "pause" } as BouncerAction)}>
            {state.paused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="bouncer-hint">
        Mouse or A/D to move paddle · Space to launch/pause · Catch power-ups every 10 bounces
      </div>
    </div>
  );
}
