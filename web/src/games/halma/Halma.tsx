import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HalmaState, HalmaSettings } from "./state.js";
import type { HalmaAction } from "./state.js";
import { isTerminal, getReachable, PLAYER_CAMP, BOT_CAMP } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Halma.css";

const CELL_SIZE = 44;

export function Halma({
  state,
  dispatch,
  onGameOver,
}: GameProps<HalmaState, HalmaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [reachable, setReachable] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.selected) {
      const coords = getReachable(state.grid, state.selected);
      setReachable(new Set(coords.map((c) => `${c.row},${c.col}`)));
    } else {
      setReachable(new Set());
    }
  }, [state.selected, state.grid]);

  const playerCampSet = new Set(PLAYER_CAMP.map((c) => `${c.row},${c.col}`));
  const botCampSet = new Set(BOT_CAMP.map((c) => `${c.row},${c.col}`));

  function handleCellClick(coord: Coord) {
    if (terminal || state.turn !== "player") return;
    const key = `${coord.row},${coord.col}`;

    if (state.selected && reachable.has(key)) {
      dispatch({ type: "move", to: coord } as HalmaAction);
      return;
    }

    const piece = state.grid.get(coord);
    if (piece === "player") {
      dispatch({ type: "select", coord } as HalmaAction);
    }
  }

  function getCellClass(coord: Coord): string {
    const key = `${coord.row},${coord.col}`;
    const isSelected = state.selected && state.selected.row === coord.row && state.selected.col === coord.col;
    const isTarget = reachable.has(key);
    let base = "halma-cell-normal";
    if (playerCampSet.has(key)) base = "halma-cell-player-camp";
    if (botCampSet.has(key)) base = "halma-cell-bot-camp";
    const extra = isSelected ? " selected-source" : isTarget ? " legal-target" : "";
    return `halma-cell ${base}${extra}`;
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "player") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "bot") { statusText = "Bot wins!"; statusClass = "loss"; }
  else { statusText = state.turn === "player" ? "Your turn (Red)" : "Bot thinking..."; }

  return (
    <div className="halma">
      <div className="halma-info">Halma 10×10 — Move all Red pieces to the Blue corner</div>
      <div className={`halma-status ${statusClass}`}>{statusText}</div>

      <div
        className="halma-board"
        style={{ gridTemplateColumns: `repeat(10, ${CELL_SIZE}px)` }}
      >
        {[...state.grid.coords()].map((coord) => {
          const piece = state.grid.get(coord);
          return (
            <div
              key={`${coord.row}-${coord.col}`}
              className={getCellClass(coord)}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
              onClick={() => handleCellClick(coord)}
            >
              {piece && <div className={`halma-piece ${piece}`} />}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Pink = your camp | Blue = your goal | Green dots = valid moves
      </div>
    </div>
  );
}
