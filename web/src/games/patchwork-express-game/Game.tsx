import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PatchworkExpressGameState, PatchworkExpressGameAction, PatchworkExpressGameSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#f8c471", "#a9cce3", "#a9dfbf", "#f5b7b1", "#d2b4de", "#7dcea0", "#85c1e9", "#f7dc6f"];

export function PatchworkExpressGameGame({ state, dispatch, onGameOver }: GameProps<PatchworkExpressGameState, PatchworkExpressGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="patex-wrap">
      <h3 className="patex-title">Patchwork Express</h3>
      <div className="patex-meta">
        <div className="patex-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="patex-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="patex-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="patex-next">
          Next tile:
          <span className="patex-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="patex-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"patex-cell " + (v < 0 ? "patex-empty" : "patex-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as PatchworkExpressGameAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="patex-done">
          <h3>Done!</h3>
          <div className="patex-final">{state.score} pts</div>
        </div>
      )}
      <div className="patex-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="patex-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="patex-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
