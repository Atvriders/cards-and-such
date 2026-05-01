import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdominoOriginsState, KingdominoOriginsAction, KingdominoOriginsSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#a04000", "#cb6c0d", "#d4ac0d", "#7d6608", "#196f3d", "#5d4037", "#34495e", "#7b3f00"];

export function KingdominoOriginsGame({ state, dispatch, onGameOver }: GameProps<KingdominoOriginsState, KingdominoOriginsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="kdomo-wrap">
      <h3 className="kdomo-title">Kingdomino: Origins</h3>
      <div className="kdomo-meta">
        <div className="kdomo-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="kdomo-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="kdomo-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="kdomo-next">
          Next tile:
          <span className="kdomo-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="kdomo-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"kdomo-cell " + (v < 0 ? "kdomo-empty" : "kdomo-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as KingdominoOriginsAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="kdomo-done">
          <h3>Done!</h3>
          <div className="kdomo-final">{state.score} pts</div>
        </div>
      )}
      <div className="kdomo-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="kdomo-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="kdomo-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
