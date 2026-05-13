import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TunnelDigState, TunnelDigAction, Dir } from "./state.js";
import { COLS, ROWS, isTerminal } from "./state.js";
import "./TunnelDig.css";

const CW = 36; // cell width px
const CH = 36; // cell height px
const PW = COLS * CW;
const PH = ROWS * CH;

export function TunnelDig({
  state,
  dispatch,
  onGameOver,
}: GameProps<TunnelDigState, Record<never, never>>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as TunnelDigAction);
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
    const held = new Set<string>();

    function onKeyDown(e: KeyboardEvent) {
      held.add(e.key);
      const s = stateRef.current;
      const dirMap: Record<string, Dir> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
        a: "left", d: "right", w: "up", s: "down",
        A: "left", D: "right", W: "up", S: "down",
      };
      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        dispatch({ type: "move", dir } as TunnelDigAction);
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dispatch({ type: "pump-start" } as TunnelDigAction);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      held.delete(e.key);
      if (e.key === " " || e.key === "Spacebar") {
        dispatch({ type: "pump-stop" } as TunnelDigAction);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { dug, enemies, playerCol, playerRow, score, lives } = state;

  const enemyColors = ["#e44", "#e94", "#4e9", "#99e", "#e4e", "#4ee"];

  return (
    <div className="tunneldig-game">
      <div className="tunneldig-header">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
      </div>

      <div className="tunneldig-grid" style={{ width: PW, height: PH }}>
        {/* Grid cells */}
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const isDug = dug[row * COLS + col];
            return (
              <div
                key={`${col}-${row}`}
                className="tunneldig-cell"
                style={{
                  left: col * CW,
                  top: row * CH,
                  width: CW,
                  height: CH,
                  background: isDug ? "#7a5530" : "#5a3510",
                  borderRight: isDug ? "none" : "1px solid #3a2000",
                  borderBottom: isDug ? "none" : "1px solid #3a2000",
                }}
              />
            );
          })
        )}

        {/* Enemies */}
        {enemies.map((e) => {
          if (!e.alive) return null;
          const pumpSize = 0.6 + e.pumpCount * 0.15;
          return (
            <div
              key={e.id}
              style={{
                position: "absolute",
                left: e.col * CW + CW / 2,
                top: e.row * CH + CH / 2,
                width: CW * pumpSize,
                height: CH * pumpSize,
                transform: "translate(-50%,-50%)",
                background: enemyColors[e.id % enemyColors.length],
                borderRadius: "50%",
                border: `${e.pumpCount}px solid #fff`,
                transition: "width 0.1s, height 0.1s",
              }}
            />
          );
        })}

        {/* Player */}
        <div
          style={{
            position: "absolute",
            left: playerCol * CW + CW / 2,
            top: playerRow * CH + CH / 2,
            width: CW * 0.7,
            height: CH * 0.7,
            transform: "translate(-50%,-50%)",
            background: "#4af",
            borderRadius: "4px",
            border: state.pumping ? "2px solid #fff" : "none",
            boxShadow: "0 0 6px #4af",
          }}
        />

        {/* Overlays */}
        {terminal && state.won && (
          <div className="tunneldig-overlay">
            <h2>You Win!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="tunneldig-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="tunneldig-controls">
        <button
          onPointerDown={() => dispatch({ type: "pump-start" } as TunnelDigAction)}
          onPointerUp={() => dispatch({ type: "pump-stop" } as TunnelDigAction)}
        >
          Pump (Space)
        </button>
      </div>

      <div className="tunneldig-hint">
        Arrow/WASD to dig and move · Space/Pump button to inflate enemies · Pump 3× to pop!
      </div>
    </div>
  );
}
