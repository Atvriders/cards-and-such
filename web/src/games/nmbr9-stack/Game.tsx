import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Nmbr9StackState, Nmbr9StackAction, Nmbr9StackSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#a93226", "#cb4335", "#f39c12", "#1f618d", "#117864", "#7d3c98", "#5d4037", "#34495e"];

export function Nmbr9StackGame({ state, dispatch, onGameOver }: GameProps<Nmbr9StackState, Nmbr9StackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="nm9s-wrap">
      <h3 className="nm9s-title">NMBR 9: Stack</h3>
      <div className="nm9s-meta">
        <div className="nm9s-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="nm9s-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="nm9s-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="nm9s-next">
          Next tile:
          <span className="nm9s-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="nm9s-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"nm9s-cell " + (v < 0 ? "nm9s-empty" : "nm9s-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as Nmbr9StackAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="nm9s-done">
          <h3>Done!</h3>
          <div className="nm9s-final">{state.score} pts</div>
        </div>
      )}
      <div className="nm9s-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="nm9s-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="nm9s-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
