import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BattleshipSoloState, BattleshipSoloSettings, BattleshipSoloAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BattleshipSoloGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BattleshipSoloState, BattleshipSoloSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleClick = useCallback(
    (index: number) => {
      if (terminal) return;
      dispatch({ type: "shoot", index } as BattleshipSoloAction);
    },
    [dispatch, terminal],
  );

  const { grid, cells, shotsLeft } = state;
  const done = state.won || state.lost;

  return (
    <div className="battleship-solo">
      <div className="battleship-solo-info">
        <span>Grid: {grid}×{grid}</span>
        <span>Shots left: {shotsLeft}</span>
        <span>Shots fired: {state.movesMade}</span>
      </div>
      <div
        className={`battleship-solo-status${state.won ? " win" : state.lost ? " lose" : ""}`}
      >
        {state.won ? "All ships sunk! Victory!" : state.lost ? "Out of shots — you lost!" : "Click to fire a shot"}
      </div>

      <div
        className="battleship-solo-grid"
        style={{ gridTemplateColumns: `repeat(${grid}, 32px)` }}
      >
        {Array.from({ length: grid * grid }, (_, i) => {
          const cs = cells[i]!;
          // After loss, reveal remaining ship cells
          const isShipCell = done && state.lost && state.ships.some((s) => s.cells.includes(i));
          let cls = "battleship-solo-cell";
          if (cs === "miss") cls += " miss";
          else if (cs === "hit") cls += " hit";
          else if (cs === "sunk") cls += " sunk";
          else if (isShipCell) cls += " revealed";
          return (
            <div
              key={i}
              className={cls}
              onClick={() => handleClick(i)}
            >
              {cs === "miss" ? "·" : cs === "hit" ? "🔥" : cs === "sunk" ? "💥" : isShipCell ? "🚢" : ""}
            </div>
          );
        })}
      </div>

      <p className="battleship-solo-hint">Click cells to fire. Hit all ships before running out of shots.</p>
    </div>
  );
}
