import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OperationFullState, OperationFullAction, OperationFullSettings } from "./state.js";
import { isTerminal, effectiveParams, MAX_BUZZERS, TOTAL_AILMENTS } from "./state.js";
import { playSound } from "../../platform/sounds.js";
import "./Game.css";

interface Pt { x: number; y: number; }

export function OperationFullGame(
  { state, dispatch, onGameOver }: GameProps<OperationFullState, OperationFullSettings>,
): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // ---------- Surface refs & cursor tracking ----------
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [surfaceSize, setSurfaceSize] = useState({ w: 320, h: 480 });
  const [cursor, setCursor] = useState<Pt | null>(null); // relative 0..1
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTsRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Observe surface size for accurate hit-testing.
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const measure = (): void => {
      const r = el.getBoundingClientRect();
      setSurfaceSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return (): void => ro.disconnect();
  }, [state.phase]);

  // RAF ticker for time-limit countdown.
  useEffect(() => {
    if (state.phase !== "active") {
      setElapsed(0);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    startTsRef.current = performance.now();
    const tick = (): void => {
      const e = performance.now() - startTsRef.current;
      setElapsed(e);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return (): void => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [state.phase]);

  // Resolve a miss when the time limit elapses.
  useEffect(() => {
    if (state.phase !== "active") return;
    const params = effectiveParams(state);
    if (!params) return;
    if (elapsed >= params.timeLimitMs) {
      dispatch({ type: "resolve", outcome: "miss" } satisfies OperationFullAction);
      playSound("lose");
    }
  }, [elapsed, state, dispatch]);

  // ---------- Geometry helpers ----------
  const toSurface = useCallback((clientX: number, clientY: number): Pt | null => {
    const el = surfaceRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }, []);

  // Returns whether the relative point lies inside the body-cavity rectangle.
  function insideCavity(p: Pt): boolean {
    if (!state.current) return false;
    const a = state.current;
    return (
      p.x >= a.cx - a.cavityW &&
      p.x <= a.cx + a.cavityW &&
      p.y >= a.cy - a.cavityH &&
      p.y <= a.cy + a.cavityH
    );
  }

  // Returns distance (relative units) from point to centre.
  function distToCentre(p: Pt): number {
    if (!state.current) return Infinity;
    const dx = p.x - state.current.cx;
    const dy = p.y - state.current.cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ---------- Pointer handlers ----------
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    if (state.phase !== "active") return;
    const p = toSurface(e.clientX, e.clientY);
    if (!p) return;
    // Must START outside the cavity (you are entering from the body surface).
    setCursor(p);
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [state.phase, toSurface]);

  const triggerBuzz = useCallback((): void => {
    setFlash(true);
    setShake(true);
    playSound("lose");
    setTimeout(() => setFlash(false), 220);
    setTimeout(() => setShake(false), 480);
    dispatch({ type: "resolve", outcome: "buzz" } satisfies OperationFullAction);
    setDragging(false);
    setCursor(null);
  }, [dispatch]);

  const triggerSuccess = useCallback((): void => {
    playSound("achievement");
    dispatch({ type: "resolve", outcome: "success" } satisfies OperationFullAction);
    setDragging(false);
    setCursor(null);
  }, [dispatch]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
    if (state.phase !== "active" || !dragging) return;
    const p = toSurface(e.clientX, e.clientY);
    if (!p) return;
    setCursor(p);
    const params = effectiveParams(state);
    if (!params) return;
    // If we touch the cavity edge — i.e. the cursor is inside the cavity
    // rectangle but within a small inner band of the edge — it's a buzz.
    // For simplicity: a buzz is when the cursor is OUTSIDE the cavity but
    // overlapping the outline ring, OR inside cavity but within `edgeBand`
    // of an edge.
    if (state.current) {
      const a = state.current;
      const inside = insideCavity(p);
      const edgeBand = 0.012; // ~1.2% surface — fairly forgiving
      const nearLeft   = Math.abs(p.x - (a.cx - a.cavityW)) < edgeBand;
      const nearRight  = Math.abs(p.x - (a.cx + a.cavityW)) < edgeBand;
      const nearTop    = Math.abs(p.y - (a.cy - a.cavityH)) < edgeBand;
      const nearBottom = Math.abs(p.y - (a.cy + a.cavityH)) < edgeBand;
      const onEdge = inside && (nearLeft || nearRight || nearTop || nearBottom);
      if (onEdge) {
        triggerBuzz();
        return;
      }
      // Reached tolerance zone?
      if (inside && distToCentre(p) <= params.tolerance) {
        triggerSuccess();
        return;
      }
    }
  }, [state, dragging, toSurface, triggerBuzz, triggerSuccess]);

  const onPointerUp = useCallback((): void => {
    setDragging(false);
  }, []);

  // ---------- UI handlers ----------
  function handleDraw(): void {
    playSound("card-deal");
    dispatch({ type: "draw" } satisfies OperationFullAction);
  }
  function handleStart(): void {
    playSound("button-click");
    dispatch({ type: "start" } satisfies OperationFullAction);
  }
  function handleNext(): void {
    playSound("button-click");
    dispatch({ type: "next" } satisfies OperationFullAction);
  }

  // ---------- Derived display values ----------
  const terminal = isTerminal(state);
  const params = state.current ? effectiveParams(state) : null;
  const timeLeft = params ? Math.max(0, params.timeLimitMs - elapsed) : 0;
  const timePct = params ? (timeLeft / params.timeLimitMs) * 100 : 0;
  const progressPct = (state.extracted / TOTAL_AILMENTS) * 100;

  // Convert relative coords to pixel positions for rendering overlays.
  const px = (rx: number): number => rx * surfaceSize.w;
  const py = (ry: number): number => ry * surfaceSize.h;

  return (
    <div className={`opf-game fade-in${shake ? " shake" : ""}`}>
      <div className="opf-header">
        <span className="opf-score pulse" data-testid="op-full-score">
          Score: <strong>{state.score}</strong>
        </span>
        <span className="opf-extracted">
          Extracted: {state.extracted}/{TOTAL_AILMENTS}
        </span>
        <span className="opf-buzzers" title={`${MAX_BUZZERS - state.buzzers} buzzer failures remaining`}>
          Buzzers: {state.buzzers}/{MAX_BUZZERS}
        </span>
      </div>

      <div className="opf-progress-bg" aria-hidden="true">
        <div className="opf-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {terminal ? (
        <div className="opf-done bounce-in" data-testid="op-full-done">
          <div className="opf-done-title">
            {state.buzzers >= MAX_BUZZERS ? "Patient buzzed out!" : "Surgery complete!"}
          </div>
          <div className="opf-done-score">Final fees: {terminal.score}</div>
          <div className="opf-done-detail">
            {state.extracted}/{TOTAL_AILMENTS} ailments extracted, {state.buzzers} buzzer{state.buzzers === 1 ? "" : "s"}.
          </div>
        </div>
      ) : (
        <>
          {state.current && (
            <div className="opf-current">
              <div className="opf-current-label">Now extracting:</div>
              <div className="opf-current-name">{state.current.name}</div>
              <div className="opf-current-meta">
                <span>{state.current.bodyPart}</span>
                <span>·</span>
                <span>{state.current.fee} pts</span>
              </div>
            </div>
          )}

          {state.activeDoctor && (
            <div className="opf-doctor" data-testid="op-full-doctor">
              <div className="opf-doctor-name">Dr. card: {state.activeDoctor.name}</div>
              <div className="opf-doctor-desc">{state.activeDoctor.description}</div>
            </div>
          )}

          {state.phase === "ready" && (
            <div className="opf-controls">
              <button
                type="button"
                className="opf-btn opf-draw-btn"
                onClick={handleDraw}
                title="Draw a doctor specialist card and reveal the next ailment"
                data-testid="op-full-draw"
              >
                Draw Card & Reveal Ailment
              </button>
            </div>
          )}

          {state.phase === "drawing" && (
            <div className="opf-controls">
              <button
                type="button"
                className="opf-btn opf-start-btn"
                onClick={handleStart}
                title="Begin the extraction attempt"
                data-testid="op-full-start"
              >
                Begin Extraction
              </button>
            </div>
          )}

          {state.phase === "active" && state.current && params && (
            <div className="opf-active">
              <div className="opf-timer-row">
                <span className="opf-timer-label">Time:</span>
                <div className="opf-timer-bar-bg">
                  <div
                    className={`opf-timer-bar-fill${timePct < 25 ? " danger" : ""}`}
                    style={{ width: `${timePct}%` }}
                  />
                </div>
                <span className="opf-timer-value">{(timeLeft / 1000).toFixed(1)}s</span>
              </div>

              <div
                ref={surfaceRef}
                className={`opf-surface${flash ? " buzz-flash" : ""}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role="application"
                aria-label="Operation patient surface — drag from outside the cavity into the tolerance zone"
              >
                {/* Patient silhouette */}
                <div className="opf-patient" aria-hidden="true" />

                {/* Cavity outline */}
                <div
                  className="opf-cavity"
                  style={{
                    left: px(state.current.cx - state.current.cavityW),
                    top: py(state.current.cy - state.current.cavityH),
                    width: px(state.current.cavityW * 2),
                    height: py(state.current.cavityH * 2),
                  }}
                />

                {/* Tolerance zone (the target circle) */}
                <div
                  className="opf-tolerance"
                  data-testid="op-full-tolerance"
                  style={{
                    left: px(state.current.cx) - px(params.tolerance),
                    top: py(state.current.cy) - py(params.tolerance),
                    width: px(params.tolerance) * 2,
                    height: py(params.tolerance) * 2,
                  }}
                />

                {/* Cursor */}
                {cursor && (
                  <div
                    className="opf-cursor"
                    style={{ left: px(cursor.x), top: py(cursor.y) }}
                    aria-hidden="true"
                  />
                )}

                {/* Hint text */}
                {!dragging && (
                  <div className="opf-hint-overlay">
                    Press & drag from anywhere outside the white outline into the red target.
                  </div>
                )}
              </div>
            </div>
          )}

          {state.phase === "result" && (
            <div className={`opf-result opf-${state.lastOutcome ?? "miss"} bounce-in`}>
              <div className="opf-result-title">
                {state.lastOutcome === "success" && `Success! +${state.lastFee}`}
                {state.lastOutcome === "miss" && (state.lastFee > 0 ? `Missed — but bonus +${state.lastFee}` : "Missed it!")}
                {state.lastOutcome === "buzz" && (state.lastFee > 0 ? `BUZZ! Bonus +${state.lastFee}` : "BUZZ! The dreaded buzzer.")}
              </div>
              <button
                type="button"
                className="opf-btn opf-next-btn"
                onClick={handleNext}
                title="Move on to the next ailment"
                data-testid="op-full-next"
              >
                Next Patient
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
