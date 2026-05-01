import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AzulQueensGardenState, AzulQueensGardenAction, AzulQueensGardenSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#196f3d", "#229954", "#52be80", "#1f618d", "#7d3c98", "#d4ac0d", "#cb4335", "#a04000"];

export function AzulQueensGardenGame({ state, dispatch, onGameOver }: GameProps<AzulQueensGardenState, AzulQueensGardenSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="azulqg-wrap">
      <h3 className="azulqg-title">Azul: Queens Garden</h3>
      <div className="azulqg-meta">
        <div className="azulqg-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="azulqg-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="azulqg-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="azulqg-next">
          Next tile:
          <span className="azulqg-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="azulqg-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"azulqg-cell " + (v < 0 ? "azulqg-empty" : "azulqg-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as AzulQueensGardenAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="azulqg-done">
          <h3>Done!</h3>
          <div className="azulqg-final">{state.score} pts</div>
        </div>
      )}
      <div className="azulqg-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="azulqg-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="azulqg-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
