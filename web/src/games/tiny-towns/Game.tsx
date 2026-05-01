import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TinyTownsState, TinyTownsAction, TinyTownsSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7b3f00", "#9c6f1a", "#5d4037", "#a04000", "#7b7d7d", "#196f3d", "#34495e", "#d4ac0d"];

export function TinyTownsGame({ state, dispatch, onGameOver }: GameProps<TinyTownsState, TinyTownsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="tt-wrap">
      <h3 className="tt-title">Tiny Towns</h3>
      <div className="tt-meta">
        <div className="tt-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="tt-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="tt-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="tt-next">
          Next tile:
          <span className="tt-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="tt-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"tt-cell " + (v < 0 ? "tt-empty" : "tt-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as TinyTownsAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="tt-done">
          <h3>Done!</h3>
          <div className="tt-final">{state.score} pts</div>
        </div>
      )}
      <div className="tt-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="tt-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="tt-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
