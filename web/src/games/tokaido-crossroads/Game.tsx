import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TokaidoCrossroadsState, TokaidoCrossroadsAction, TokaidoCrossroadsSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7d3c98", "#1f618d", "#196f3d", "#cb4335", "#d4ac0d", "#a04000", "#5d4037", "#34495e"];

export function TokaidoCrossroadsGame({ state, dispatch, onGameOver }: GameProps<TokaidoCrossroadsState, TokaidoCrossroadsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="tokc-wrap">
      <h3 className="tokc-title">Tokaido: Crossroads</h3>
      <div className="tokc-meta">
        <div className="tokc-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="tokc-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="tokc-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="tokc-next">
          Next tile:
          <span className="tokc-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="tokc-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"tokc-cell " + (v < 0 ? "tokc-empty" : "tokc-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as TokaidoCrossroadsAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="tokc-done">
          <h3>Done!</h3>
          <div className="tokc-final">{state.score} pts</div>
        </div>
      )}
      <div className="tokc-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="tokc-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="tokc-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
