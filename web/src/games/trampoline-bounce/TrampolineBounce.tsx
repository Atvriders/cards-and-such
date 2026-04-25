import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrampolineBounceState, TrampolineBounceAction, TrampolineBounceSettings } from "./state.js";
import { isTerminal, TRAMPOLINE_Y, WINDOW_SIZE } from "./state.js";
import "./TrampolineBounce.css";

const CW = 320;
const CH = 480;

export function TrampolineBounce({
  state,
  dispatch,
  onGameOver,
}: GameProps<TrampolineBounceState, TrampolineBounceSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; lastTimeRef.current = null; return; }
    if (lastTimeRef.current !== null) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as TrampolineBounceAction);
    }
    lastTimeRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

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
      if (s.over) return;
      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        if (s.jumperVy === 0) dispatch({ type: "start" } as TrampolineBounceAction);
        else dispatch({ type: "bounce" } as TrampolineBounceAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const jumperPixelY = state.jumperY * CH;
  const trampolinePixelY = TRAMPOLINE_Y * CH;
  const windowTop = (TRAMPOLINE_Y - WINDOW_SIZE) * CH;
  const isIdle = state.jumperVy === 0;

  return (
    <div className="trampoline-game">
      <div className="trampoline-header">
        <span>Score: {state.score}</span>
        <span>{"❤️ ".repeat(state.lives)}</span>
      </div>

      <div
        className="trampoline-field"
        style={{ width: CW, height: CH }}
        onClick={() => {
          if (state.over) return;
          if (isIdle) dispatch({ type: "start" } as TrampolineBounceAction);
          else dispatch({ type: "bounce" } as TrampolineBounceAction);
        }}
      >
        {/* Bounce window indicator */}
        <div
          className="bounce-window"
          style={{ top: windowTop, height: WINDOW_SIZE * CH }}
        />

        {/* Trampoline */}
        <div className="trampoline-mat" style={{ top: trampolinePixelY }} />

        {/* Jumper */}
        <div
          className={`trampoline-jumper${state.bounceWindowOpen ? " in-window" : ""}${state.missedBounce ? " missed" : ""}`}
          style={{ top: jumperPixelY - 24, left: CW / 2 - 16 }}
        />

        {state.over && (
          <div className="trampoline-overlay">
            <div className="trampoline-message">
              <div>Game Over!</div>
              <div>Bounces: {state.score}</div>
            </div>
          </div>
        )}

        {isIdle && !state.over && (
          <div className="trampoline-prompt">Click or Space to jump!</div>
        )}
      </div>
      <div className="trampoline-hint">
        Press Space / Click when jumper enters the green zone!
      </div>
    </div>
  );
}
