import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BattleshipState, BattleshipSettings } from "./state.js";
import { type BattleshipAction, SHIPS, GRID_SIZE, isTerminal } from "./state.js";
import "./Game.css";

function coordArray(): Array<{ row: number; col: number }> {
  const coords = [];
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      coords.push({ row: r, col: c });
  return coords;
}

export function Battleship({
  state,
  dispatch,
  onGameOver,
}: GameProps<BattleshipState, BattleshipSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isPlaying = state.phase === "playing";
  const isSetup = state.phase === "setup";
  const currentShip = isSetup && state.setupShipIndex < SHIPS.length ? SHIPS[state.setupShipIndex] : null;

  function handleEnemyClick(row: number, col: number) {
    if (!isPlaying || state.winner !== null) return;
    dispatch({ type: "fire", row, col } satisfies BattleshipAction);
  }

  function handlePlayerGridClick(row: number, col: number) {
    if (!isSetup) return;
    dispatch({ type: "placeShip", row, col } satisfies BattleshipAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! Enemy fleet destroyed!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! Your fleet was sunk."; statusClass = "loss"; }
  else if (isSetup) {
    statusText = currentShip
      ? `Place your ${currentShip.name} (size ${currentShip.size}) — ${state.setupHorizontal ? "Horizontal" : "Vertical"}`
      : "Fleet placed — starting game...";
  } else {
    statusText = "Click the enemy grid to fire a shot.";
  }

  return (
    <div className="battleship">
      <div className={`battleship-status ${statusClass}`}>{statusText}</div>

      {isSetup && (
        <div className="battleship-setup">
          <div className="battleship-ship-list">
            {SHIPS.map((ship, i) => (
              <div
                key={ship.name}
                className={`battleship-ship-item ${i === state.setupShipIndex ? "current" : i < state.setupShipIndex ? "placed" : ""}`}
              >
                <span>{ship.name}</span>
                <span>{"█".repeat(ship.size)}</span>
              </div>
            ))}
          </div>
          <div className="battleship-actions">
            <button className="bs-btn secondary" onClick={() => dispatch({ type: "rotateShip" })}>
              Rotate ({state.setupHorizontal ? "H" : "V"})
            </button>
            <button className="bs-btn primary" onClick={() => dispatch({ type: "autoPlace" })}>
              Auto-Place
            </button>
          </div>
        </div>
      )}

      <div className="battleship-grids">
        {/* Player's own grid */}
        <div className="battleship-grid-wrap">
          <div className="battleship-grid-label">Your Fleet</div>
          <div
            className="battleship-grid"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)` }}
          >
            {coordArray().map(({ row, col }) => {
              const cell = state.playerGrid.get({ row, col });
              return (
                <div
                  key={`p-${row}-${col}`}
                  className={`bs-cell ${cell}`}
                  onClick={() => handlePlayerGridClick(row, col)}
                  data-testid={`player-${row}-${col}`}
                  title={`${row},${col}: ${cell}`}
                >
                  {cell === "hit" ? "✕" : cell === "miss" ? "·" : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Enemy grid */}
        <div className="battleship-grid-wrap">
          <div className="battleship-grid-label">Enemy Waters</div>
          <div
            className="battleship-grid"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)` }}
          >
            {coordArray().map(({ row, col }) => {
              const cell = state.enemyGrid.get({ row, col });
              const clickable = isPlaying && cell === "unknown" && state.winner === null;
              return (
                <div
                  key={`e-${row}-${col}`}
                  className={`bs-cell ${cell} ${clickable ? "clickable" : ""}`}
                  onClick={() => handleEnemyClick(row, col)}
                  data-testid={`enemy-${row}-${col}`}
                  title={`${row},${col}`}
                >
                  {cell === "hit" ? "✕" : cell === "miss" ? "·" : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="battleship-score-info">
        Enemy ships remaining: {state.enemyShips.filter((s) => s.hits < s.size).length} / {SHIPS.length}
      </div>
    </div>
  );
}
