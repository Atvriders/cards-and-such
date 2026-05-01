import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonneTowerBuildState, CarcassonneTowerBuildAction, CarcassonneTowerBuildSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7b7d7d", "#5d4037", "#34495e", "#6e2c00", "#a04000", "#2e4053", "#566573", "#1c2833"];

export function CarcassonneTowerBuildGame({ state, dispatch, onGameOver }: GameProps<CarcassonneTowerBuildState, CarcassonneTowerBuildSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="carctb-wrap">
      <h3 className="carctb-title">Carcassonne: Tower Build</h3>
      <div className="carctb-meta">
        <div className="carctb-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="carctb-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="carctb-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="carctb-next">
          Next tile:
          <span className="carctb-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="carctb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"carctb-cell " + (v < 0 ? "carctb-empty" : "carctb-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CarcassonneTowerBuildAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="carctb-done">
          <h3>Done!</h3>
          <div className="carctb-final">{state.score} pts</div>
        </div>
      )}
      <div className="carctb-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="carctb-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="carctb-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
