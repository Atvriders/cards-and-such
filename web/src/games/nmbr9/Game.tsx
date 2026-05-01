import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Nmbr9State, Nmbr9Action, Nmbr9Settings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#3498db", "#27ae60", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"];

export function Nmbr9Game({ state, dispatch, onGameOver }: GameProps<Nmbr9State, Nmbr9Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="nm9-wrap">
      <h3 className="nm9-title">NMBR 9</h3>
      <div className="nm9-meta">
        <div className="nm9-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="nm9-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="nm9-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="nm9-next">
          Next tile:
          <span className="nm9-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="nm9-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"nm9-cell " + (v < 0 ? "nm9-empty" : "nm9-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as Nmbr9Action)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="nm9-done">
          <h3>Done!</h3>
          <div className="nm9-final">{state.score} pts</div>
        </div>
      )}
      <div className="nm9-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="nm9-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="nm9-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
