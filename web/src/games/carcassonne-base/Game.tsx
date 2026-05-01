import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonneBaseState, CarcassonneBaseAction, CarcassonneBaseSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7d6608", "#196f3d", "#7b241c", "#9c6f1a", "#5d4037", "#1e8449", "#a04000", "#4a235a"];

export function CarcassonneBaseGame({ state, dispatch, onGameOver }: GameProps<CarcassonneBaseState, CarcassonneBaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="carcb-wrap">
      <h3 className="carcb-title">Carcassonne</h3>
      <div className="carcb-meta">
        <div className="carcb-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="carcb-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="carcb-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="carcb-next">
          Next tile:
          <span className="carcb-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="carcb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"carcb-cell " + (v < 0 ? "carcb-empty" : "carcb-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CarcassonneBaseAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="carcb-done">
          <h3>Done!</h3>
          <div className="carcb-final">{state.score} pts</div>
        </div>
      )}
      <div className="carcb-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="carcb-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="carcb-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
