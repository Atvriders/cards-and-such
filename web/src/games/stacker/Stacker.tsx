import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StackerState } from "./state.js";
import { isTerminal, COLS } from "./state.js";
import type { stackerSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Stacker.css";

type StackerSettings = SettingsOf<typeof stackerSettings>;

const CELL = 36;     // px per column unit
const ROW_H = 22;    // px per row
const VISIBLE_ROWS = 14;

export function Stacker({
  state,
  dispatch,
  onGameOver,
}: GameProps<StackerState, StackerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !terminal) {
        e.preventDefault();
        dispatch({ type: "drop" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminal, dispatch]);

  const totalWidth = COLS * CELL;
  const totalHeight = VISIBLE_ROWS * ROW_H;

  // We show the top VISIBLE_ROWS of the stack + the moving block
  const stackLen = state.stack.length;
  const startRow = Math.max(0, stackLen - VISIBLE_ROWS + 2);

  const visibleStack = state.stack.slice(startRow);
  // Moving block is above the top of the stack
  const movingRowIndex = stackLen - startRow; // row above last visible

  return (
    <div className="stacker">
      <div className="stk-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Height: <strong>{state.stack.length}</strong></span>
        {state.phase === "gameover" && (
          <span className="stk-gameover-label">GAME OVER</span>
        )}
      </div>

      <div className="stk-arena" style={{ width: totalWidth, height: totalHeight }}>
        {/* Stack rows */}
        {visibleStack.map((row, i) => {
          const rowFromBottom = visibleStack.length - 1 - i;
          const top = totalHeight - (rowFromBottom + 1) * ROW_H;
          const hue = 200 + (i + startRow) * 8;
          return (
            <div
              key={i + startRow}
              className="stk-row"
              style={{
                left: row.x * CELL,
                top,
                width: row.width * CELL,
                height: ROW_H - 2,
                background: `hsl(${hue % 360}, 70%, 55%)`,
              }}
            />
          );
        })}

        {/* Moving block */}
        {!terminal && (
          <div
            className="stk-moving"
            style={{
              left: state.movingX * CELL,
              top: totalHeight - (movingRowIndex + 1) * ROW_H,
              width: state.moving.width * CELL,
              height: ROW_H - 2,
            }}
          />
        )}
      </div>

      {terminal ? (
        <div className="stk-ended">Game over! Score: {terminal.score} · Height: {state.stack.length}</div>
      ) : (
        <div className="stk-hint">Press <kbd>Space</kbd> or <button className="stk-drop-btn" onClick={() => dispatch({ type: "drop" })}>Drop!</button></div>
      )}
    </div>
  );
}
