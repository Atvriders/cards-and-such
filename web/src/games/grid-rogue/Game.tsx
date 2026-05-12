import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GridRogueState, GridRogueAction, Dir } from "./state.js";
import { isTerminal, GRID_SIZE } from "./state.js";
import "./Game.css";

const CELL_ICONS: Record<string, string> = {
  wall: "█", enemy: "☠", exit: "X", potion: "♥", gold: "$", floor: " ",
};

export function GridRogue({ state, dispatch, onGameOver }: GameProps<GridRogueState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const move = (dir: Dir) => dispatch({ type: "move", dir } as GridRogueAction);

  return (
    <div className="gr-wrap">
      <div className="gr-header">
        <span className="gr-title">Grid Rogue</span>
        <span>Floor {state.floor}/5</span>
        <span>HP {state.playerHp}/{state.playerMaxHp}</span>
        <span>Gold {state.gold}</span>
      </div>

      <div className="gr-grid">
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => {
            const isPlayer = x === state.playerX && y === state.playerY;
            const cell = state.grid[y]![x]!;
            let cls = `gr-cell gr-${cell.type}`;
            let icon = CELL_ICONS[cell.type] ?? " ";
            if (isPlayer) { cls = "gr-cell gr-player"; icon = "@"; }
            return <div key={`${x}-${y}`} className={cls}>{icon}</div>;
          })
        )}
      </div>

      <div className="gr-controls">
        <div className="gr-row"><button data-testid="hint-target-grid-rogue-action" title="Move up" className="gr-btn" onClick={() => move("up")}>▲</button></div>
        <div className="gr-row">
          <button title="Move left" className="gr-btn" onClick={() => move("left")}>◄</button>
          <button title="Move down" className="gr-btn" onClick={() => move("down")}>▼</button>
          <button title="Move right" className="gr-btn" onClick={() => move("right")}>►</button>
        </div>
      </div>

      {state.phase === "won" && <div className="gr-end gr-won">Victory! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="gr-end gr-dead">Died on floor {state.floor}. Score: {terminal?.score}</div>}

      <div className="gr-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="gr-log-line">{l}</div>)}
      </div>
    </div>
  );
}
