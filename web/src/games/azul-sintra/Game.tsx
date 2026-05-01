import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AzulSintraState, AzulSintraAction, AzulSintraSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#21618c", "#2874a6", "#5dade2", "#aed6f1", "#1abc9c", "#117864", "#7d6608", "#34495e"];

export function AzulSintraGame({ state, dispatch, onGameOver }: GameProps<AzulSintraState, AzulSintraSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="azulsi-wrap">
      <h3 className="azulsi-title">Azul: Sintra</h3>
      <div className="azulsi-meta">
        <div className="azulsi-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="azulsi-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="azulsi-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="azulsi-next">
          Next tile:
          <span className="azulsi-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="azulsi-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"azulsi-cell " + (v < 0 ? "azulsi-empty" : "azulsi-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as AzulSintraAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="azulsi-done">
          <h3>Done!</h3>
          <div className="azulsi-final">{state.score} pts</div>
        </div>
      )}
      <div className="azulsi-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="azulsi-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="azulsi-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
