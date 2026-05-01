import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CalicoQuiltState, CalicoQuiltAction, CalicoQuiltSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#3498db", "#27ae60", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"];

export function CalicoQuiltGame({ state, dispatch, onGameOver }: GameProps<CalicoQuiltState, CalicoQuiltSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="calq-wrap">
      <h3 className="calq-title">Calico Quilt</h3>
      <div className="calq-meta">
        <div className="calq-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="calq-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="calq-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="calq-next">
          Next tile:
          <span className="calq-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="calq-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"calq-cell " + (v < 0 ? "calq-empty" : "calq-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CalicoQuiltAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="calq-done">
          <h3>Done!</h3>
          <div className="calq-final">{state.score} pts</div>
        </div>
      )}
      <div className="calq-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="calq-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="calq-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
