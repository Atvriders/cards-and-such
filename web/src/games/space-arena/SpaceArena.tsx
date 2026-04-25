import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpaceArenaState, SpaceArenaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SpaceArena.css";

const COLS = 9;
const ROWS = 7;

export function SpaceArena({ state, dispatch, onGameOver }: GameProps<SpaceArenaState, SpaceArenaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const ms = state.settings.difficulty === "easy" ? 600 : state.settings.difficulty === "hard" ? 250 : 400;
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [terminal, state.settings.difficulty, dispatch, onGameOver]);

  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  // Draw enemies at row 0
  for (const e of state.enemies) {
    if (e.x >= 0 && e.x < COLS) grid[0]![e.x] = e.hp > 1 ? "👾" : "🛸";
  }
  // Draw bullets
  for (const b of state.bullets) {
    if (b.y >= 0 && b.y < ROWS && b.x >= 0 && b.x < COLS) {
      grid[b.y]![b.x] = b.fromPlayer ? "🔵" : "🔴";
    }
  }
  // Draw player at bottom row
  grid[ROWS - 1]![state.playerX] = state.shieldActive ? "🛡️" : "🚀";

  return (
    <div className="space-arena">
      <div className="sa-hud">
        <span>Wave: {state.wave}</span>
        <span>HP: {"❤️".repeat(Math.max(0, state.playerHp))}</span>
        <span>Score: {state.score}</span>
        <span>Shield: {state.shieldCooldown > 0 ? `cd ${state.shieldCooldown}` : "ready"}</span>
      </div>

      <div className="sa-grid">
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => (
            <div key={`${row}-${col}`} className="sa-cell">
              {grid[row]![col]}
            </div>
          ))
        )}
      </div>

      <div className="sa-controls">
        <button onClick={() => dispatch({ type: "moveLeft" })} disabled={state.gameOver}>◀ Left</button>
        <button onClick={() => dispatch({ type: "shoot" })} disabled={state.gameOver}>🔵 Shoot</button>
        <button onClick={() => dispatch({ type: "shield" })} disabled={state.gameOver || state.shieldCooldown > 0}>🛡 Shield</button>
        <button onClick={() => dispatch({ type: "moveRight" })} disabled={state.gameOver}>Right ▶</button>
      </div>

      <div className="sa-hint">Move left/right · Shoot enemies · Shield blocks one hit (cooldown 10 ticks)</div>

      {state.gameOver && (
        <>
          <div className="sa-game-over">Ship destroyed! Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </>
      )}
    </div>
  );
}
