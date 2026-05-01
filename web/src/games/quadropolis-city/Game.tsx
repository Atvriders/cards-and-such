import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuadropolisCityState, QuadropolisCityAction, QuadropolisCitySettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#34495e", "#a04000", "#d4ac0d", "#196f3d", "#1f618d", "#7b3f00", "#566573", "#5d4037"];

export function QuadropolisCityGame({ state, dispatch, onGameOver }: GameProps<QuadropolisCityState, QuadropolisCitySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="qdc-wrap">
      <h3 className="qdc-title">Quadropolis: City</h3>
      <div className="qdc-meta">
        <div className="qdc-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="qdc-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="qdc-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="qdc-next">
          Next tile:
          <span className="qdc-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="qdc-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"qdc-cell " + (v < 0 ? "qdc-empty" : "qdc-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as QuadropolisCityAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="qdc-done">
          <h3>Done!</h3>
          <div className="qdc-final">{state.score} pts</div>
        </div>
      )}
      <div className="qdc-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="qdc-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="qdc-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
