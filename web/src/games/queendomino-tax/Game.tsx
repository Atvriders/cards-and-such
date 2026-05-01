import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QueendominoTaxState, QueendominoTaxAction, QueendominoTaxSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7d6608", "#9c6f1a", "#7d3c98", "#6c3483", "#a04000", "#196f3d", "#34495e", "#5d4037"];

export function QueendominoTaxGame({ state, dispatch, onGameOver }: GameProps<QueendominoTaxState, QueendominoTaxSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="qdomt-wrap">
      <h3 className="qdomt-title">Queendomino: Tax</h3>
      <div className="qdomt-meta">
        <div className="qdomt-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="qdomt-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="qdomt-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="qdomt-next">
          Next tile:
          <span className="qdomt-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="qdomt-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"qdomt-cell " + (v < 0 ? "qdomt-empty" : "qdomt-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as QueendominoTaxAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="qdomt-done">
          <h3>Done!</h3>
          <div className="qdomt-final">{state.score} pts</div>
        </div>
      )}
      <div className="qdomt-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="qdomt-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="qdomt-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
