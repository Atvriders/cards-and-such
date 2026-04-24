import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TreasureState, TreasureSettings } from "./state.js";
import type { TreasureAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const CELL_ICON: Record<string, string> = {
  hidden: "",
  empty: "❄️",
  warm: "🔆",
  hot: "🔥",
  treasure: "💎",
};

export function TreasureHunt({ state, dispatch, onGameOver }: GameProps<TreasureState, TreasureSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const gridStyle = { gridTemplateColumns: `repeat(${state.size}, 60px)` };

  return (
    <div className="th-game">
      <div className={`th-status${state.found ? " win" : ""}`}>{state.message}</div>
      <div className="th-info">Digs: {state.digs}</div>

      <div className="th-grid" style={gridStyle}>
        {state.grid.map((cell, i) => (
          <div
            key={i}
            className={`th-cell${cell !== "hidden" ? " dug" : ""} ${cell}`}
            onClick={() => cell === "hidden" && dispatch({ type: "dig", index: i } satisfies TreasureAction)}
          >
            {CELL_ICON[cell] ?? ""}
          </div>
        ))}
      </div>

      <div className="th-legend">
        <span>❄️ Cold</span>
        <span>🔆 Warm</span>
        <span>🔥 Hot</span>
        <span>💎 Treasure</span>
      </div>
    </div>
  );
}
