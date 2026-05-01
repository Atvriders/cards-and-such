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
      <div className="gamsl-wrap">
        <div className="gamsl-done">
          <h2>Game Over</h2>
          <div className="gamsl-stats">Best tile: {state.best} • Moves: {state.moves}</div>
          <div className="gamsl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  if (state.phase === "won") {
    return (
      <div className="gamsl-wrap">
        <div className="gamsl-done">
          <h2>You reached {TARGET}!</h2>
          <div className="gamsl-stats">Moves: {state.moves}</div>
          <div className="gamsl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  function tap(dir: Direction): void { dispatch({ type: "slide", dir } as Game1024Action); }
  return (
    <div className="gamsl-wrap">
      <div className="gamsl-header">
        <span className="gamsl-info">Moves: {state.moves}</span>
        <span className="gamsl-target">Target: {TARGET}</span>
        <span className="gamsl-score">{state.score}</span>
      </div>
      <div className="gamsl-grid">
        {state.grid.flat().map((v, i) => (
          <div key={i} className="gamsl-cell" style={{ background: v ? (TILE_COLORS[v] ?? "#3c3a32") : "rgba(238,228,218,0.35)", color: v <= 4 ? "#776e65" : "#f9f6f2" }}>
            {v ? v : ""}
          </div>
        ))}
      </div>
      <div className="gamsl-pad">
        <div></div><button className="gamsl-btn" onClick={() => tap("up")}>↑</button><div></div>
        <button className="gamsl-btn" onClick={() => tap("left")}>←</button>
        <button className="gamsl-btn" onClick={() => tap("down")}>↓</button>
        <button className="gamsl-btn" onClick={() => tap("right")}>→</button>
      </div>
      <div className="gamsl-hint">Use arrow keys or WASD</div>
    </div>
  );
}
