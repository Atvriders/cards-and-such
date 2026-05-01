import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreesPuzzleState, ThreesPuzzleAction, ThreesPuzzleSettings, Direction } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";

const TILE_COLORS: Record<number, string> = {
  2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563",
  32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61",
  512: "#edc850", 1024: "#edc53f", 2048: "#edc22e", 4096: "#3c3a32",
};

export function ThreesPuzzleGame({ state, dispatch, onGameOver }: GameProps<ThreesPuzzleState, ThreesPuzzleSettings>): JSX.Element {
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
      if (dir) { e.preventDefault(); dispatch({ type: "slide", dir } as ThreesPuzzleAction); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch]);
  if (state.phase === "done") {
    return (
      <div className="thrsl-wrap">
        <div className="thrsl-done">
          <h2>Game Over</h2>
          <div className="thrsl-stats">Best tile: {state.best} • Moves: {state.moves}</div>
          <div className="thrsl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  if (state.phase === "won") {
    return (
      <div className="thrsl-wrap">
        <div className="thrsl-done">
          <h2>You reached {TARGET}!</h2>
          <div className="thrsl-stats">Moves: {state.moves}</div>
          <div className="thrsl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  function tap(dir: Direction): void { dispatch({ type: "slide", dir } as ThreesPuzzleAction); }
  return (
    <div className="thrsl-wrap">
      <div className="thrsl-header">
        <span className="thrsl-info">Moves: {state.moves}</span>
        <span className="thrsl-target">Target: {TARGET}</span>
        <span className="thrsl-score">{state.score}</span>
      </div>
      <div className="thrsl-grid">
        {state.grid.flat().map((v, i) => (
          <div key={i} className="thrsl-cell" style={{ background: v ? (TILE_COLORS[v] ?? "#3c3a32") : "rgba(238,228,218,0.35)", color: v <= 4 ? "#776e65" : "#f9f6f2" }}>
            {v ? v : ""}
          </div>
        ))}
      </div>
      <div className="thrsl-pad">
        <div></div><button className="thrsl-btn" onClick={() => tap("up")}>↑</button><div></div>
        <button className="thrsl-btn" onClick={() => tap("left")}>←</button>
        <button className="thrsl-btn" onClick={() => tap("down")}>↓</button>
        <button className="thrsl-btn" onClick={() => tap("right")}>→</button>
      </div>
      <div className="thrsl-hint">Use arrow keys or WASD</div>
    </div>
  );
}
