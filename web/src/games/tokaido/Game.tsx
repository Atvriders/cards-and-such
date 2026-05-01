import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TokaidoState, TokaidoAction, TokaidoSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#1f618d", "#7b241c", "#d4ac0d", "#e8a89e", "#196f3d", "#5d4037", "#7d3c98", "#34495e"];

export function TokaidoGame({ state, dispatch, onGameOver }: GameProps<TokaidoState, TokaidoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="tok-wrap">
      <h3 className="tok-title">Tokaido</h3>
      <div className="tok-meta">
        <div className="tok-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="tok-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="tok-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="tok-next">
          Next tile:
          <span className="tok-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="tok-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"tok-cell " + (v < 0 ? "tok-empty" : "tok-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as TokaidoAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="tok-done">
          <h3>Done!</h3>
          <div className="tok-final">{state.score} pts</div>
        </div>
      )}
      <div className="tok-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="tok-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="tok-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
