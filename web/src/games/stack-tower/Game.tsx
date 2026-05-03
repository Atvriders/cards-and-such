import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StackTowerState, StackTowerAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 320;
const PH = 560;
const BLOCK_H = 28;
const VISIBLE_BLOCKS = 14;

type Settings = { speed: "slow" | "normal" | "fast" };

export function StackTower({ state, dispatch }: GameProps<StackTowerState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as StackTowerAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTimeRef.current = null; }
    };
  }, [state.over, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        dispatch({ type: "drop" } as StackTowerAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { stack, moving, score } = state;

  // Scroll: show top of stack
  const topIdx = stack.length - 1;
  const startIdx = Math.max(0, topIdx - VISIBLE_BLOCKS + 1);
  const visibleStack = stack.slice(startIdx);

  return (
    <div className="st-game">
      <div className="st-header">
        <span>Score: {score}</span>
        <span>Level: {stack.length}</span>
      </div>

      <div
        className="st-playfield"
        style={{ width: PW, height: PH }}
        onClick={() => dispatch({ type: "drop" } as StackTowerAction)}
      >
        {/* Settled blocks */}
        {visibleStack.map((b, i) => {
          const blockIdx = startIdx + i;
          // Render from bottom: block 0 at bottom
          const fromBottom = blockIdx - startIdx;
          const top = PH - (fromBottom + 1) * BLOCK_H;
          return (
            <div
              key={blockIdx}
              className="st-block"
              style={{
                left: b.x * PW,
                top,
                width: b.width * PW,
                height: BLOCK_H - 2,
                background: b.color,
              }}
            />
          );
        })}

        {/* Moving block */}
        {!terminal && (
          <div
            className="st-block"
            style={{
              left: moving.x * PW,
              top: PH - (visibleStack.length + 1) * BLOCK_H,
              width: moving.width * PW,
              height: BLOCK_H - 2,
              background: moving.color,
              boxShadow: "0 0 8px rgba(255,255,255,0.5)",
            }}
          />
        )}

        {terminal && (
          <div className="st-overlay">
            <h2>Missed!</h2>
            <p>Score: {terminal.score}</p>
            <p>Level: {stack.length}</p>
          </div>
        )}
      </div>

      <div className="st-controls">
        <button data-testid="hint-target-stack-tower-action" onClick={() => dispatch({ type: "drop" } as StackTowerAction)}>
          Drop Block
        </button>
      </div>

      <div className="st-hint">Space / Click to drop · Land as precisely as possible!</div>
    </div>
  );
}
