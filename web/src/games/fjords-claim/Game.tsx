import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FjordsClaimState, FjordsClaimAction, FjordsClaimSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#1f618d", "#2874a6", "#5dade2", "#566573", "#34495e", "#196f3d", "#7b3f00", "#1c2833"];

export function FjordsClaimGame({ state, dispatch, onGameOver }: GameProps<FjordsClaimState, FjordsClaimSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="fjc-wrap">
      <h3 className="fjc-title">Fjords: Claim</h3>
      <div className="fjc-meta">
        <div className="fjc-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="fjc-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="fjc-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="fjc-next">
          Next tile:
          <span className="fjc-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="fjc-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"fjc-cell " + (v < 0 ? "fjc-empty" : "fjc-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as FjordsClaimAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="fjc-done">
          <h3>Done!</h3>
          <div className="fjc-final">{state.score} pts</div>
        </div>
      )}
      <div className="fjc-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="fjc-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="fjc-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
