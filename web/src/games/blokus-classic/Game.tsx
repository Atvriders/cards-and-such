import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlokusClassicState, BlokusClassicAction, BlokusClassicSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#c0392b", "#2980b9", "#27ae60", "#f1c40f", "#8e44ad", "#d35400", "#16a085", "#2c3e50"];

export function BlokusClassicGame({ state, dispatch, onGameOver }: GameProps<BlokusClassicState, BlokusClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="blkc-wrap fade-in">
      <h3 className="blkc-title">Blokus Classic</h3>
      <div className="blkc-meta">
        <div className="blkc-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="blkc-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="blkc-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="blkc-next">
          Next tile:
          <span className="blkc-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="blkc-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"blkc-cell " + (v < 0 ? "blkc-empty" : "blkc-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as BlokusClassicAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="blkc-done bounce-in">
          <h3>Done!</h3>
          <div className="blkc-final">{state.score} pts</div>
        </div>
      )}
      <div className="blkc-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="blkc-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="blkc-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
