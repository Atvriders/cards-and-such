import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonneSouthSeasState, CarcassonneSouthSeasAction, CarcassonneSouthSeasSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#0e4d92", "#21618c", "#2874a6", "#3498db", "#5dade2", "#85c1e9", "#aed6f1", "#d4e6f1"];

export function CarcassonneSouthSeasGame({ state, dispatch, onGameOver }: GameProps<CarcassonneSouthSeasState, CarcassonneSouthSeasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="carcss-wrap">
      <h3 className="carcss-title">Carcassonne: South Seas</h3>
      <div className="carcss-meta">
        <div className="carcss-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="carcss-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="carcss-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="carcss-next">
          Next tile:
          <span className="carcss-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="carcss-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"carcss-cell " + (v < 0 ? "carcss-empty" : "carcss-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CarcassonneSouthSeasAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="carcss-done">
          <h3>Done!</h3>
          <div className="carcss-final">{state.score} pts</div>
        </div>
      )}
      <div className="carcss-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="carcss-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="carcss-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
