import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SagradaState, SagradaAction, SagradaSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7b241c", "#1f618d", "#196f3d", "#d4ac0d", "#7d3c98", "#cb4335", "#117864", "#34495e"];

export function SagradaGame({ state, dispatch, onGameOver }: GameProps<SagradaState, SagradaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="sgrd-wrap">
      <h3 className="sgrd-title">Sagrada</h3>
      <div className="sgrd-meta">
        <div className="sgrd-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="sgrd-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="sgrd-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="sgrd-next">
          Next tile:
          <span className="sgrd-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="sgrd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"sgrd-cell " + (v < 0 ? "sgrd-empty" : "sgrd-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as SagradaAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="sgrd-done">
          <h3>Done!</h3>
          <div className="sgrd-final">{state.score} pts</div>
        </div>
      )}
      <div className="sgrd-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="sgrd-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="sgrd-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
