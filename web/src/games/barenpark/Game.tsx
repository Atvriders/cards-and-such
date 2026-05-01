import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarenparkState, BarenparkAction, BarenparkSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#196f3d", "#229954", "#7b3f00", "#5d4037", "#d4ac0d", "#a04000", "#34495e", "#7d6608"];

export function BarenparkGame({ state, dispatch, onGameOver }: GameProps<BarenparkState, BarenparkSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="bp-wrap">
      <h3 className="bp-title">Bärenpark</h3>
      <div className="bp-meta">
        <div className="bp-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="bp-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="bp-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="bp-next">
          Next tile:
          <span className="bp-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="bp-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"bp-cell " + (v < 0 ? "bp-empty" : "bp-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as BarenparkAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="bp-done">
          <h3>Done!</h3>
          <div className="bp-final">{state.score} pts</div>
        </div>
      )}
      <div className="bp-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="bp-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="bp-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
