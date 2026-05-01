import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdominoGiantsState, KingdominoGiantsAction, KingdominoGiantsSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#5d4037", "#7b3f00", "#a04000", "#196f3d", "#566573", "#34495e", "#7d6608", "#9c6f1a"];

export function KingdominoGiantsGame({ state, dispatch, onGameOver }: GameProps<KingdominoGiantsState, KingdominoGiantsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="kdomg-wrap">
      <h3 className="kdomg-title">Kingdomino: Giants</h3>
      <div className="kdomg-meta">
        <div className="kdomg-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="kdomg-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="kdomg-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="kdomg-next">
          Next tile:
          <span className="kdomg-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="kdomg-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"kdomg-cell " + (v < 0 ? "kdomg-empty" : "kdomg-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as KingdominoGiantsAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="kdomg-done">
          <h3>Done!</h3>
          <div className="kdomg-final">{state.score} pts</div>
        </div>
      )}
      <div className="kdomg-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="kdomg-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="kdomg-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
