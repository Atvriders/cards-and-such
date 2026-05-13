import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TankState, TankAction, TankSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./TankBattle.css";

const TICK_MS = 250;

export function TankBattle({
  state,
  dispatch,
  onGameOver,
}: GameProps<TankState, TankSettings>): JSX.Element {
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

  const tick = useCallback(() => {
    dispatch({ type: "tick" } as TankAction);
  }, [dispatch]);

  useEffect(() => {
    if (state.over) return;
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [state.over, tick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (s.over) return;
      const map: Record<string, () => void> = {
        ArrowUp: () => dispatch({ type: "move", dx: 0, dy: -1 } as TankAction),
        ArrowDown: () => dispatch({ type: "move", dx: 0, dy: 1 } as TankAction),
        ArrowLeft: () => dispatch({ type: "move", dx: -1, dy: 0 } as TankAction),
        ArrowRight: () => dispatch({ type: "move", dx: 1, dy: 0 } as TankAction),
        w: () => dispatch({ type: "move", dx: 0, dy: -1 } as TankAction),
        s: () => dispatch({ type: "move", dx: 0, dy: 1 } as TankAction),
        a: () => dispatch({ type: "move", dx: -1, dy: 0 } as TankAction),
        d: () => dispatch({ type: "move", dx: 1, dy: 0 } as TankAction),
        " ": () => dispatch({ type: "shoot" } as TankAction),
        f: () => dispatch({ type: "shoot" } as TankAction),
      };
      const fn = map[e.key];
      if (fn) { e.preventDefault(); fn(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { gridSize, walls, player, enemies, bullets } = state;

  // Build cell map
  const grid: string[][] = Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) => {
      if (walls[y]?.[x]) return "wall";
      if (player.x === x && player.y === y) return "player";
      if (enemies.some((e) => e.x === x && e.y === y)) return "enemy";
      const b = bullets.find((b) => b.x === x && b.y === y);
      if (b) return b.fromPlayer ? "bullet" : "enemybullet";
      return "empty";
    })
  );

  const CELL_CHAR: Record<string, string> = {
    wall: "",
    empty: "",
    player: "▲",
    enemy: "▼",
    bullet: "•",
    enemybullet: "◦",
  };

  return (
    <div className="tank-game">
      <div className="tank-header">
        <span>Score: {state.score}</span>
        <span>{"❤️".repeat(state.lives)}</span>
        <span>Enemies: {state.enemies.length}</span>
      </div>

      <div
        className="tank-grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 28px)` }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${x},${y}`} className={`tank-cell tank-cell--${cell}`}>
              {CELL_CHAR[cell]}
            </div>
          ))
        )}
      </div>

      {terminal ? (
        <div className="tank-overlay">
          <h2>{state.enemies.length === 0 ? "Victory!" : "Game Over"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      ) : (
        <>
          <div className="tank-controls">
            <div />
            <button data-testid="hint-target-tank-battle-action" title="Move up" onClick={() => dispatch({ type: "move", dx: 0, dy: -1 } as TankAction)}>▲</button>
            <div />
            <button title="Move left" onClick={() => dispatch({ type: "move", dx: -1, dy: 0 } as TankAction)}>◀</button>
            <button title="Shoot" onClick={() => dispatch({ type: "shoot" } as TankAction)}>🔥</button>
            <button title="Move right" onClick={() => dispatch({ type: "move", dx: 1, dy: 0 } as TankAction)}>▶</button>
            <div />
            <button title="Move down" onClick={() => dispatch({ type: "move", dx: 0, dy: 1 } as TankAction)}>▼</button>
            <div />
          </div>
          <div className="tank-hint">Arrow/WASD to move · Space/F to shoot</div>
        </>
      )}
    </div>
  );
}
