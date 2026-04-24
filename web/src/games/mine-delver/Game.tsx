import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MineDelverState, MineDelverAction, TileType } from "./state.js";
import { isTerminal, COLS, ROWS } from "./state.js";
import "./Game.css";

const TILE_ICONS: Record<TileType, string> = {
  rock: "█", ore: "◆", gem: "✦", monster: "☠", lava: "▲", ladder: "↑", empty: "·",
};

export function MineDelver({ state, dispatch, onGameOver }: GameProps<MineDelverState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const dig = (col: number) => dispatch({ type: "dig", col } as MineDelverAction);
  const nextRow = state.playerRow + 1;

  return (
    <div className="md-wrap">
      <div className="md-header">
        <span className="md-title">Mine Delver</span>
        <span>Row {Math.max(0, state.playerRow + 1)}/{ROWS}</span>
        <span>HP {state.playerHp}/{state.playerMaxHp}</span>
        <span>Gold {state.gold}</span>
      </div>

      <div className="md-grid">
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const tile = state.grid[row]?.[col];
            if (!tile) return null;
            const isNext = row === nextRow && state.phase === "digging";
            const hidden = !tile.revealed;
            let cls = `md-tile`;
            if (hidden) { cls += " md-hidden"; }
            else { cls += ` md-${tile.type}`; }
            if (isNext) cls += " md-player-row";
            return (
              <div key={`${row}-${col}`} className={cls}
                onClick={() => isNext && !hidden ? dig(col) : undefined}>
                {hidden ? "?" : TILE_ICONS[tile.type]}
              </div>
            );
          })
        )}
      </div>

      {state.phase === "digging" && nextRow < ROWS && (
        <div className="md-instructions">Click a tile in the highlighted row to dig down</div>
      )}

      {state.phase === "escaped" && <div className="md-end md-win">Escaped! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="md-end md-dead">Lost in the mine. Score: {terminal?.score}</div>}

      <div className="md-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="md-log-line">{l}</div>)}
      </div>
    </div>
  );
}
