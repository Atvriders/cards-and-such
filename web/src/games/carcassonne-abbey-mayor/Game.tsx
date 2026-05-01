import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorAction, CarcassonneAbbeyMayorSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#34495e", "#566573", "#7d6608", "#9c6f1a", "#196f3d", "#cb4335", "#922b21", "#1c2833"];

export function CarcassonneAbbeyMayorGame({ state, dispatch, onGameOver }: GameProps<CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="carcam-wrap">
      <h3 className="carcam-title">Carcassonne: Abbey & Mayor</h3>
      <div className="carcam-meta">
        <div className="carcam-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="carcam-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="carcam-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="carcam-next">
          Next tile:
          <span className="carcam-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="carcam-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"carcam-cell " + (v < 0 ? "carcam-empty" : "carcam-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CarcassonneAbbeyMayorAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="carcam-done">
          <h3>Done!</h3>
          <div className="carcam-final">{state.score} pts</div>
        </div>
      )}
      <div className="carcam-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="carcam-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="carcam-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
