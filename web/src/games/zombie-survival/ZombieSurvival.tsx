import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZombieSurvivalState, ZombieSurvivalSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ZombieSurvival.css";

const COLS = 7;
const ROWS = 7;
const PLAYER_ROW = 6;
const BARRICADE_ROW = 5;

export function ZombieSurvival({ state, dispatch, onGameOver }: GameProps<ZombieSurvivalState, ZombieSurvivalSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const ms = state.settings.difficulty === "easy" ? 700 : state.settings.difficulty === "hard" ? 300 : 500;
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [terminal, state.settings.difficulty, dispatch, onGameOver]);

  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  for (const z of state.zombies) {
    if (z.x >= 0 && z.x < COLS && z.y >= 0 && z.y < ROWS) {
      grid[z.y]![z.x] = z.hp > 1 ? "🧟" : "😵";
    }
  }
  grid[PLAYER_ROW]![state.playerX] = "🧍";

  return (
    <div className="zombie-survival">
      <div className="zs-hud">
        <span>Day: {state.day}</span>
        <span>HP: {"❤️".repeat(Math.max(0, state.playerHp))}</span>
        <span>Ammo: {state.ammo}</span>
        <span>Barricade: {state.barricadeHp > 0 ? `${state.barricadeHp}HP` : "destroyed"}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="zs-grid">
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => (
            <div
              key={`${row}-${col}`}
              className={`zs-cell${row === BARRICADE_ROW ? " barricade-row" : ""}${row === PLAYER_ROW ? " player-row" : ""}`}
            >
              {row === BARRICADE_ROW && state.barricadeHp > 0 && grid[row]![col] === "" ? "🪵" : grid[row]![col]}
            </div>
          ))
        )}
      </div>

      <div className="zs-controls">
        <button data-testid="hint-target-zombie-survival-action" onClick={() => dispatch({ type: "moveLeft" })} disabled={state.gameOver}>◀ Left</button>
        <button onClick={() => dispatch({ type: "shoot" })} disabled={state.gameOver || state.ammo === 0}>🔫 Shoot</button>
        <button onClick={() => dispatch({ type: "moveRight" })} disabled={state.gameOver}>Right ▶</button>
      </div>

      <div className="zs-hint">Move and shoot zombies in your column. Barricade row slows them. Ammo refills every 8 ticks.</div>

      {state.gameOver && (
        <>
          <div className="zs-game-over">Overrun on Day {state.day}! Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Try Again</button>
        </>
      )}
    </div>
  );
}
