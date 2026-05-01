import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdominoDuelState, KingdominoDuelAction, KingdominoDuelSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#3498db", "#27ae60", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"];

export function KingdominoDuelGame({ state, dispatch, onGameOver }: GameProps<KingdominoDuelState, KingdominoDuelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="kdomd-wrap">
      <h3 className="kdomd-title">Kingdomino Duel</h3>
      <div className="kdomd-meta">
        <div className="kdomd-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="kdomd-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="kdomd-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="kdomd-next">
          Next tile:
          <span className="kdomd-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="kdomd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"kdomd-cell " + (v < 0 ? "kdomd-empty" : "kdomd-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as KingdominoDuelAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="kdomd-done">
          <h3>Done!</h3>
          <div className="kdomd-final">{state.score} pts</div>
        </div>
      )}
      <div className="kdomd-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="kdomd-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="kdomd-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
