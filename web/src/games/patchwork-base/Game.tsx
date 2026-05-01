import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PatchworkBaseState, PatchworkBaseAction, PatchworkBaseSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#f5b7b1", "#a9cce3", "#f9e79f", "#a9dfbf", "#d2b4de", "#fad7a0", "#aed6f1", "#f8c471"];

export function PatchworkBaseGame({ state, dispatch, onGameOver }: GameProps<PatchworkBaseState, PatchworkBaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="patb-wrap">
      <h3 className="patb-title">Patchwork Base</h3>
      <div className="patb-meta">
        <div className="patb-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="patb-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="patb-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="patb-next">
          Next tile:
          <span className="patb-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="patb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"patb-cell " + (v < 0 ? "patb-empty" : "patb-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as PatchworkBaseAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="patb-done">
          <h3>Done!</h3>
          <div className="patb-final">{state.score} pts</div>
        </div>
      )}
      <div className="patb-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="patb-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="patb-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
