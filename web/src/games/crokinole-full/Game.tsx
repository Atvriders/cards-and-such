import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  BOARD_RADIUS,
  DISC_RADIUS,
  HOLE_RADIUS,
  PEG_RADIUS,
  RING_INNER,
  RING_MIDDLE,
  RING_OUTER,
  cpuPlan,
  isTerminal,
  type CrokinoleAction,
  type CrokinoleSettings,
  type CrokinoleState,
} from "./state.js";
import "./Game.css";

const VIEW = 440; // px square viewport for the board
const CENTER = VIEW / 2;
const SCALE = (VIEW / 2 - 6) / BOARD_RADIUS;

function toScreen(x: number, y: number): { sx: number; sy: number } {
  return { sx: CENTER + x * SCALE, sy: CENTER + y * SCALE };
}
function fromScreen(sx: number, sy: number): { x: number; y: number } {
  return { x: (sx - CENTER) / SCALE, y: (sy - CENTER) / SCALE };
}

export function CrokinoleFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrokinoleState, CrokinoleSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  // One-time game-over wiring (per platform contract).
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Physics tick loop while sim phase active.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "sim") {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      dispatch({ type: "tick" } as CrokinoleAction);
    }, 16);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.phase, dispatch]);

  // CPU auto-shoot. When phase is aim and turn is 1 (CPU), wait ~500ms then dispatch.
  const cpuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.phase === "aim" && state.turn === 1 && state.remaining[1] > 0) {
      cpuTimeoutRef.current = setTimeout(() => {
        const plan = cpuPlan(stateRef.current);
        dispatch({
          type: "shoot",
          angle: plan.angle,
          power: plan.power,
          from: plan.from,
        } as CrokinoleAction);
      }, 600);
    }
    return () => {
      if (cpuTimeoutRef.current !== null) {
        clearTimeout(cpuTimeoutRef.current);
        cpuTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.turn, state.remaining, dispatch]);

  // Drag-aim UI (click-and-drag a slingshot from any rim point).
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const human = state.turn === 0 && state.phase === "aim" && state.remaining[0] > 0;

  const aimInfo = useMemo(() => {
    if (!dragStart || !dragCurrent) return null;
    // Slingshot: drag direction is OPPOSITE of fire direction.
    const dxs = dragCurrent.x - dragStart.x;
    const dys = dragCurrent.y - dragStart.y;
    const len = Math.hypot(dxs, dys);
    const maxDrag = BOARD_RADIUS * 1.2;
    const power = Math.max(0, Math.min(1, len / maxDrag));
    const angle = Math.atan2(-dys, -dxs); // shoot opposite of drag
    return { angle, power };
  }, [dragStart, dragCurrent]);

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!human) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (VIEW / rect.width);
    const sy = (e.clientY - rect.top) * (VIEW / rect.height);
    const w = fromScreen(sx, sy);
    // Snap start onto rim of human side (positive y).
    const r = Math.hypot(w.x, w.y);
    if (r > BOARD_RADIUS) return;
    setDragStart({ x: w.x, y: w.y });
    setDragCurrent({ x: w.x, y: w.y });
  };
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (VIEW / rect.width);
    const sy = (e.clientY - rect.top) * (VIEW / rect.height);
    const w = fromScreen(sx, sy);
    setDragCurrent({ x: w.x, y: w.y });
  };
  const onMouseUp = () => {
    if (!human || !dragStart || !aimInfo) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    if (aimInfo.power > 0.05) {
      dispatch({
        type: "shoot",
        angle: aimInfo.angle,
        power: aimInfo.power,
        from: dragStart,
      } as CrokinoleAction);
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!human) return;
    const t = e.touches[0];
    if (!t) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (t.clientX - rect.left) * (VIEW / rect.width);
    const sy = (t.clientY - rect.top) * (VIEW / rect.height);
    const w = fromScreen(sx, sy);
    if (Math.hypot(w.x, w.y) > BOARD_RADIUS) return;
    setDragStart({ x: w.x, y: w.y });
    setDragCurrent({ x: w.x, y: w.y });
  };
  const onTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    const t = e.touches[0];
    if (!t) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (t.clientX - rect.left) * (VIEW / rect.width);
    const sy = (t.clientY - rect.top) * (VIEW / rect.height);
    const w = fromScreen(sx, sy);
    setDragCurrent({ x: w.x, y: w.y });
  };
  const onTouchEnd = () => {
    onMouseUp();
  };

  const t = isTerminal(state);
  const inRoundEnd = state.phase === "round-end";

  // Rendering helpers
  const rims = [
    { r: BOARD_RADIUS, fill: "#6e3b1f", label: "" },
    { r: RING_OUTER, fill: "#c79363", label: "5" },
    { r: RING_MIDDLE, fill: "#e0b07b", label: "10" },
    { r: RING_INNER, fill: "#f3cf99", label: "15" },
  ];

  const human0 = state.discs.filter(d => d.owner === 0 && (d.alive || d.holed));
  const cpu1 = state.discs.filter(d => d.owner === 1 && (d.alive || d.holed));

  const startScreen = dragStart ? toScreen(dragStart.x, dragStart.y) : null;
  const currScreen = dragCurrent ? toScreen(dragCurrent.x, dragCurrent.y) : null;
  // Predicted fire direction line: opposite of drag relative to start.
  let aimLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (startScreen && currScreen && aimInfo) {
    const len = 60 + aimInfo.power * 160;
    aimLine = {
      x1: startScreen.sx,
      y1: startScreen.sy,
      x2: startScreen.sx + Math.cos(aimInfo.angle) * len,
      y2: startScreen.sy + Math.sin(aimInfo.angle) * len,
    };
  }

  const handleReset = useCallback(() => {
    endedRef.current = false;
    dispatch({ type: "reset" } as CrokinoleAction);
  }, [dispatch]);

  return (
    <div className="cf-wrap fade-in">
      <div className="cf-hud">
        <div className="cf-side cf-you">
          <div className="cf-label">You</div>
          <div className="cf-score pulse" data-testid="crokinole-full-score-human">
            {state.score[0]}
          </div>
          <div className="cf-discs">Discs left: {state.remaining[0]}</div>
        </div>
        <div className="cf-mid">
          <div className="cf-round">Round {state.round}</div>
          <div className="cf-target">First to {state.settings.target}</div>
          <div className="cf-turn">
            {state.phase === "sim"
              ? "Discs in motion…"
              : state.phase === "aim"
              ? state.turn === 0
                ? "Your shot — click & drag on the board"
                : "CPU thinking…"
              : state.phase === "round-end"
              ? "Round complete"
              : "Match over"}
          </div>
        </div>
        <div className="cf-side cf-cpu">
          <div className="cf-label">CPU</div>
          <div className="cf-score pulse" data-testid="crokinole-full-score-cpu">
            {state.score[1]}
          </div>
          <div className="cf-discs">Discs left: {state.remaining[1]}</div>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="cf-board"
        data-testid="crokinole-full-board"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={VIEW}
        height={VIEW}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Outer board */}
        <rect x={0} y={0} width={VIEW} height={VIEW} fill="#3b2317" />
        {/* Rings */}
        {rims.map((ring, i) => (
          <circle
            key={i}
            cx={CENTER}
            cy={CENTER}
            r={ring.r * SCALE}
            fill={ring.fill}
            stroke="#3b2317"
            strokeWidth={2}
          />
        ))}
        {/* Center hole */}
        <circle cx={CENTER} cy={CENTER} r={HOLE_RADIUS * SCALE} fill="#1a0e07" />
        {/* Cross lines on quadrants */}
        <line
          x1={CENTER - BOARD_RADIUS * SCALE}
          y1={CENTER}
          x2={CENTER + BOARD_RADIUS * SCALE}
          y2={CENTER}
          stroke="#7e4d2c"
          strokeWidth={1}
          opacity={0.4}
        />
        <line
          x1={CENTER}
          y1={CENTER - BOARD_RADIUS * SCALE}
          x2={CENTER}
          y2={CENTER + BOARD_RADIUS * SCALE}
          stroke="#7e4d2c"
          strokeWidth={1}
          opacity={0.4}
        />
        {/* Ring labels */}
        <text x={CENTER} y={CENTER - (RING_MIDDLE + RING_INNER) / 2 * SCALE} className="cf-rlabel">15</text>
        <text x={CENTER} y={CENTER - (RING_OUTER + RING_MIDDLE) / 2 * SCALE} className="cf-rlabel">10</text>
        <text x={CENTER} y={CENTER - (BOARD_RADIUS + RING_OUTER) / 2 * SCALE} className="cf-rlabel">5</text>
        {/* Pegs */}
        {state.pegs.map((p, i) => {
          const { sx, sy } = toScreen(p.x, p.y);
          return (
            <circle
              key={`peg-${i}`}
              cx={sx}
              cy={sy}
              r={PEG_RADIUS * SCALE}
              fill="#d8b27a"
              stroke="#2a1809"
              strokeWidth={1}
            />
          );
        })}
        {/* Discs */}
        {human0.map(d => {
          if (d.holed) return null;
          const { sx, sy } = toScreen(d.x, d.y);
          return (
            <circle
              key={`d-${d.id}`}
              cx={sx}
              cy={sy}
              r={DISC_RADIUS * SCALE}
              fill="#e93f3f"
              stroke="#7d1010"
              strokeWidth={1.5}
            />
          );
        })}
        {cpu1.map(d => {
          if (d.holed) return null;
          const { sx, sy } = toScreen(d.x, d.y);
          return (
            <circle
              key={`d-${d.id}`}
              cx={sx}
              cy={sy}
              r={DISC_RADIUS * SCALE}
              fill="#2563d9"
              stroke="#0f2960"
              strokeWidth={1.5}
            />
          );
        })}
        {/* Aim drag indicator */}
        {startScreen && currScreen && (
          <line
            x1={startScreen.sx}
            y1={startScreen.sy}
            x2={currScreen.sx}
            y2={currScreen.sy}
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}
        {aimLine && (
          <line
            x1={aimLine.x1}
            y1={aimLine.y1}
            x2={aimLine.x2}
            y2={aimLine.y2}
            stroke="#fffa6e"
            strokeWidth={3}
            opacity={0.85}
          />
        )}
      </svg>

      {state.lastShot && state.phase !== "sim" && !state.lastShot.success && (
        <div className="cf-msg cf-msg-warn">{state.lastShot.reason}</div>
      )}

      {inRoundEnd && (
        <div className="cf-round-end bounce-in">
          <div className="cf-round-end-title">Round {state.round} complete</div>
          <div className="cf-round-end-line">
            You +{state.lastRoundScore[0]} · CPU +{state.lastRoundScore[1]}
          </div>
          <button
            data-testid="crokinole-full-next-round"
            className="cf-btn"
            onClick={() => dispatch({ type: "next-round" } as CrokinoleAction)}
          >
            Next round
          </button>
        </div>
      )}

      {t && (
        <div className="cf-overlay bounce-in">
          <h2>{state.score[0] > state.score[1] ? "Match won!" : "Match lost"}</h2>
          <p>
            Final: You {state.score[0]} — CPU {state.score[1]}
          </p>
          <button
            data-testid="crokinole-full-reset"
            className="cf-btn"
            onClick={handleReset}
            title="Start a new match"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
