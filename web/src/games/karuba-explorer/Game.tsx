import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KarubaExplorerState, KarubaExplorerAction, KarubaExplorerSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#196f3d", "#229954", "#7b3f00", "#9c6f1a", "#d4ac0d", "#cb4335", "#5d4037", "#117864"];

export function KarubaExplorerGame({ state, dispatch, onGameOver }: GameProps<KarubaExplorerState, KarubaExplorerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="kar-wrap">
      <h3 className="kar-title">Karuba: Explorer</h3>
      <div className="kar-meta">
        <div className="kar-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="kar-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="kar-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="kar-next">
          Next tile:
          <span className="kar-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="kar-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"kar-cell " + (v < 0 ? "kar-empty" : "kar-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as KarubaExplorerAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="kar-done">
          <h3>Done!</h3>
          <div className="kar-final">{state.score} pts</div>
        </div>
      )}
      <div className="kar-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="kar-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="kar-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
