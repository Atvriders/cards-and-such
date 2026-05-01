import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonnePrincessDragonState, CarcassonnePrincessDragonAction, CarcassonnePrincessDragonSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#7d3c98", "#6c3483", "#a569bd", "#cb4335", "#922b21", "#d4ac0d", "#1abc9c", "#1f618d"];

export function CarcassonnePrincessDragonGame({ state, dispatch, onGameOver }: GameProps<CarcassonnePrincessDragonState, CarcassonnePrincessDragonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="carcpd-wrap">
      <h3 className="carcpd-title">Carcassonne: Princess & Dragon</h3>
      <div className="carcpd-meta">
        <div className="carcpd-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="carcpd-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="carcpd-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="carcpd-next">
          Next tile:
          <span className="carcpd-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="carcpd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"carcpd-cell " + (v < 0 ? "carcpd-empty" : "carcpd-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as CarcassonnePrincessDragonAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="carcpd-done">
          <h3>Done!</h3>
          <div className="carcpd-final">{state.score} pts</div>
        </div>
      )}
      <div className="carcpd-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="carcpd-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="carcpd-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
