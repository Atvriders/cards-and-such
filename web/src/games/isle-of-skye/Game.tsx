import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IsleOfSkyeState, IsleOfSkyeAction, IsleOfSkyeSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES, TYPE_NAMES, typeName } from "./state.js";
import "./Game.css";

const PALETTE = ["#196f3d", "#566573", "#34495e", "#7d6608", "#5d4037", "#1f618d", "#229954", "#1c2833"];

export function IsleOfSkyeGame({ state, dispatch, onGameOver }: GameProps<IsleOfSkyeState, IsleOfSkyeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const next = state.queue[state.placed] ?? -1;
  return (
    <div className="ios-wrap">
      <h3 className="ios-title">Isle of Skye</h3>
      <div className="ios-meta">
        <div className="ios-meta-item"><span>Tile</span><b>{Math.min(state.placed + 1, TOTAL_TILES)}/{TOTAL_TILES}</b></div>
        <div className="ios-meta-item"><span>Score</span><b>{state.score}</b></div>
        <div className="ios-meta-item"><span>Phase</span><b>{state.phase}</b></div>
      </div>
      {state.phase !== "done" && next >= 0 && (
        <div className="ios-next">
          Next tile:
          <span className="ios-next-tile" style={{ background: PALETTE[next % PALETTE.length] }}>{typeName(next)}</span>
        </div>
      )}
      <div className="ios-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={"ios-cell " + (v < 0 ? "ios-empty" : "ios-filled")}
            style={v >= 0 ? { background: PALETTE[v % PALETTE.length], color: "#fff" } : undefined}
            onClick={() => v < 0 && state.phase !== "done" && dispatch({ type: "place", index: i } as IsleOfSkyeAction)}
            disabled={v >= 0 || state.phase === "done"}
            aria-label={v >= 0 ? typeName(v) : "empty cell"}
          >{v >= 0 ? typeName(v).slice(0, 2) : ""}</button>
        ))}
      </div>
      {state.phase === "done" && (
        <div className="ios-done">
          <h3>Done!</h3>
          <div className="ios-final">{state.score} pts</div>
        </div>
      )}
      <div className="ios-legend">
        {TYPE_NAMES.map((n, i) => (
          <span key={i} className="ios-leg" style={{ background: PALETTE[i % PALETTE.length] }}>{n}</span>
        ))}
      </div>
      <div className="ios-rules">Place tiles adjacent to same-type tiles for +2 each. Clusters of 3+ score +4 bonus, 5+ +8.</div>
    </div>
  );
}
