import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarenparkBaseState, BarenparkBaseAction, BarenparkBaseSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#229954", "#52be80", "#7b3f00", "#a04000", "#d4ac0d", "#5d4037", "#34495e", "#117864"];

export function BarenparkBaseGame({ state, dispatch, onGameOver }: GameProps<BarenparkBaseState, BarenparkBaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="bpb-wrap">
      <h3 className="bpb-title">Bärenpark Base</h3>
      <div className="bpb-meta">
        <div className="bpb-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="bpb-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="bpb-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="bpb-next">
          Next tile:
          <span className="bpb-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="bpb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"bpb-cell " + (v < 0 ? "bpb-empty" : "bpb-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as BarenparkBaseAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="bpb-done">
          <h3>Done!</h3>
          <div className="bpb-final">{state.score} pts</div>
        </div>
      )}
      <div className="bpb-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="bpb-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="bpb-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
