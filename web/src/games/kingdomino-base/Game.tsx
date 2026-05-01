import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdominoBaseState, KingdominoBaseAction, KingdominoBaseSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#196f3d", "#2874a6", "#d4ac0d", "#5d4037", "#a04000", "#7d3c98", "#229954", "#1c2833"];

export function KingdominoBaseGame({ state, dispatch, onGameOver }: GameProps<KingdominoBaseState, KingdominoBaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="kdomb-wrap">
      <h3 className="kdomb-title">Kingdomino Base</h3>
      <div className="kdomb-meta">
        <div className="kdomb-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="kdomb-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="kdomb-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="kdomb-next">
          Next tile:
          <span className="kdomb-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="kdomb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"kdomb-cell " + (v < 0 ? "kdomb-empty" : "kdomb-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as KingdominoBaseAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="kdomb-done">
          <h3>Done!</h3>
          <div className="kdomb-final">{state.score} pts</div>
        </div>
      )}
      <div className="kdomb-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="kdomb-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="kdomb-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
