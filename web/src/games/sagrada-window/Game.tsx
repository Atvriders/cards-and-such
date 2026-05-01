import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SagradaWindowState, SagradaWindowAction, SagradaWindowSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#1f618d", "#2874a6", "#7d3c98", "#cb4335", "#d4ac0d", "#196f3d", "#7b241c", "#34495e"];

export function SagradaWindowGame({ state, dispatch, onGameOver }: GameProps<SagradaWindowState, SagradaWindowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="sgrdw-wrap">
      <h3 className="sgrdw-title">Sagrada: Window</h3>
      <div className="sgrdw-meta">
        <div className="sgrdw-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="sgrdw-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="sgrdw-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="sgrdw-next">
          Next tile:
          <span className="sgrdw-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="sgrdw-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"sgrdw-cell " + (v < 0 ? "sgrdw-empty" : "sgrdw-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as SagradaWindowAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="sgrdw-done">
          <h3>Done!</h3>
          <div className="sgrdw-final">{state.score} pts</div>
        </div>
      )}
      <div className="sgrdw-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="sgrdw-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="sgrdw-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
