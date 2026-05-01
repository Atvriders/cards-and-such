import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Game1024State, Game1024Action, Game1024Settings, Direction } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";

const TILE_COLORS: Record<number, string> = {
  2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563",
  32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61",
  512: "#edc850", 1024: "#edc53f", 2048: "#edc22e", 4096: "#3c3a32",
};

export function Game1024Game({ state, dispatch, onGameOver }: GameProps<Game1024State, Game1024Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      const map: Record<string, Direction> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); dispatch({ type: "slide", dir } as Game1024Action); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="g1024-wrap">
        <div className="g1024-done">
          <h2>Game Over</h2>
          <div className="g1024-stats">Best tile: {state.best} • Moves: {state.moves}</div>
          <div className="g1024-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  if (state.phase === "won") {
    return (
      <div className="g1024-wrap">
        <div className="g1024-done">
          <h2>You reached {TARGET}!</h2>
          <div className="g1024-stats">Moves: {state.moves}</div>
          <div className="g1024-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  function tap(dir: Direction): void { dispatch({ type: "slide", dir } as Game1024Action); }
  return (
    <div className="g1024-wrap">
      <div className="g1024-header">
        <span className="g1024-info">Moves: {state.moves}</span>
        <span className="g1024-target">Target: {TARGET}</span>
        <span className="g1024-score">{state.score}</span>
      </div>
      <div className="g1024-grid">
        {state.grid.flat().map((v, i) => (
          <div key={i} className="g1024-cell" style={{ background: v ? (TILE_COLORS[v] ?? "#3c3a32") : "rgba(238,228,218,0.35)", color: v <= 4 ? "#776e65" : "#f9f6f2" }}>
            {v ? v : ""}
          </div>
        ))}
      </div>
      <div className="g1024-pad">
        <div></div><button className="g1024-btn" onClick={() => tap("up")}>↑</button><div></div>
        <button className="g1024-btn" onClick={() => tap("left")}>←</button>
        <button className="g1024-btn" onClick={() => tap("down")}>↓</button>
        <button className="g1024-btn" onClick={() => tap("right")}>→</button>
      </div>
      <div className="g1024-hint">Use arrow keys or WASD</div>
    </div>
  );
}
