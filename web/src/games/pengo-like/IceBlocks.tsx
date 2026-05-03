import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IceBlocksState, IceBlocksAction } from "./state.js";
import { COLS, ROWS, isTerminal } from "./state.js";
import "./IceBlocks.css";

const CW = 38;
const CH = 38;
const PW = COLS * CW;
const PH = ROWS * CH;

export function IceBlocks({
  state,
  dispatch,
}: GameProps<IceBlocksState, Record<never, never>>): JSX.Element {
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
          dispatch({ type: "tick", dt } as IceBlocksAction);
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") {
        e.preventDefault();
        dispatch({ type: "move", dir: "left" } as IceBlocksAction);
      } else if (k === "ArrowRight" || k === "d" || k === "D") {
        e.preventDefault();
        dispatch({ type: "move", dir: "right" } as IceBlocksAction);
      } else if (k === "ArrowUp" || k === "w" || k === "W") {
        e.preventDefault();
        dispatch({ type: "move", dir: "up" } as IceBlocksAction);
      } else if (k === "ArrowDown" || k === "s" || k === "S") {
        e.preventDefault();
        dispatch({ type: "move", dir: "down" } as IceBlocksAction);
      } else if (k === " " || k === "Spacebar" || k === "f" || k === "F") {
        e.preventDefault();
        dispatch({ type: "push" } as IceBlocksAction);
      }
      void s;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { grid, foes, playerCol, playerRow, score, lives } = state;

  const cellColors: Record<string, string> = {
    empty: "#adf",
    block: "#6bf",
    wall: "#369",
    diamond: "#ff0",
  };

  return (
    <div className="iceblocks-game">
      <div className="iceblocks-header">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
        <span>Diamonds: {grid.filter((c) => c === "diamond").length} left</span>
      </div>

      <div className="iceblocks-grid" style={{ width: PW, height: PH, background: "#adf" }}>
        {/* Grid cells */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const cell = grid[row * COLS + col]!;
            if (cell === "empty") return null;
            return (
              <div
                key={`${col}-${row}`}
                style={{
                  position: "absolute",
                  left: col * CW + 1,
                  top: row * CH + 1,
                  width: CW - 2,
                  height: CH - 2,
                  background: cellColors[cell] ?? "#adf",
                  borderRadius: cell === "diamond" ? "50%" : cell === "wall" ? 0 : 4,
                  boxShadow: cell === "diamond" ? "0 0 8px #ff0" : undefined,
                  border: cell === "block" ? "2px solid #8cf" : cell === "wall" ? "2px solid #258" : undefined,
                }}
              />
            );
          })
        )}

        {/* Foes */}
        {foes.map((f) => {
          if (!f.alive) return null;
          return (
            <div
              key={f.id}
              style={{
                position: "absolute",
                left: f.col * CW + 4,
                top: f.row * CH + 4,
                width: CW - 8,
                height: CH - 8,
                background: f.frozen ? "#8ff" : "#e44",
                borderRadius: "50%",
                border: f.frozen ? "2px solid #0af" : "2px solid #a00",
                boxShadow: f.frozen ? "0 0 6px #0af" : "0 0 4px #e44",
                opacity: f.frozen ? 0.7 : 1,
              }}
            />
          );
        })}

        {/* Player */}
        <div
          style={{
            position: "absolute",
            left: playerCol * CW + 4,
            top: playerRow * CH + 4,
            width: CW - 8,
            height: CH - 8,
            background: "#4af",
            borderRadius: "4px",
            border: "2px solid #069",
            boxShadow: "0 0 6px #4af",
          }}
        />

        {terminal && state.won && (
          <div className="iceblocks-overlay">
            <h2>You Win!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="iceblocks-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="iceblocks-controls">
        <button data-testid="hint-target-pengo-like-action" onClick={() => dispatch({ type: "push" } as IceBlocksAction)}>Push Block (Space/F)</button>
      </div>

      <div className="iceblocks-hint">
        Arrow/WASD to move · Space/F to push block · Slide blocks into enemies to freeze them!
      </div>
    </div>
  );
}
