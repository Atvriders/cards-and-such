import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorAction, CarcassonneAbbeyMayorSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_TILES } from "./state.js";
import "./Game.css";

const TILE_COLORS = ["#7f8c8d","#f1c40f","#27ae60","#34495e","#e67e22"];
const TILE_LABELS = ["A","M","G","B","S"];

export function CarcassonneAbbeyMayorGame({ state, dispatch, onGameOver }: GameProps<CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="tp-wrap">
        <div className="tp-done">
          <h2>Done!</h2>
          <div className="tp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  const next = state.queue[state.placed] ?? 0;
  return (
    <div className="tp-wrap">
      <div className="tp-info">Tile {state.placed + 1} / {TOTAL_TILES}</div>
      <div className="tp-next">
        Next:
        <span className="tp-next-tile" style={{ background: TILE_COLORS[next] }}>{TILE_LABELS[next]}</span>
      </div>
      <div className="tp-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)` }}>
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={`tp-cell${v < 0 ? " empty" : " filled"}`}
            style={v >= 0 ? { background: TILE_COLORS[v] } : undefined}
            onClick={() => v < 0 && dispatch({ type: "place", index: i } as CarcassonneAbbeyMayorAction)}
            disabled={v >= 0}
          >{v >= 0 ? TILE_LABELS[v] : ""}</button>
        ))}
      </div>
    </div>
  );
}
