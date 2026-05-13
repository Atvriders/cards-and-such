import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  BattleshipFullState,
  BattleshipFullSettings,
  BattleshipFullAction,
} from "./state.js";
import { SHIPS, GRID_SIZE, isTerminal, aliveCount } from "./state.js";
import "./Game.css";

type Mode = "salvo" | "sonar" | "fighter";

function coordArray(): Array<{ row: number; col: number }> {
  const coords = [];
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      coords.push({ row: r, col: c });
  return coords;
}

export function BattleshipFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BattleshipFullState, BattleshipFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  const [mode, setMode] = useState<Mode>("salvo");

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const isPlaying = state.phase === "playing";
  const isSetup = state.phase === "setup";
  const currentShip =
    isSetup && state.setupShipIndex < SHIPS.length
      ? SHIPS[state.setupShipIndex]
      : null;
  const aliveShips = aliveCount(state.playerShips);
  const enemyAlive = state.enemyShips.filter((s) => s.hits < s.size).length;
  const pendingSet = new Set(state.pendingShots.map((c) => `${c.row},${c.col}`));

  function handleEnemyClick(row: number, col: number) {
    if (!isPlaying || state.winner !== null) return;
    if (mode === "salvo") {
      // Toggle queue
      if (pendingSet.has(`${row},${col}`)) {
        dispatch({ type: "unqueueShot", row, col } satisfies BattleshipFullAction);
      } else {
        dispatch({ type: "queueShot", row, col } satisfies BattleshipFullAction);
      }
    } else if (mode === "sonar") {
      dispatch({ type: "sonarPing", row, col } satisfies BattleshipFullAction);
      setMode("salvo");
    } else if (mode === "fighter") {
      dispatch({ type: "fighterJet", row, col } satisfies BattleshipFullAction);
      setMode("salvo");
    }
  }

  function handlePlayerGridClick(row: number, col: number) {
    if (!isSetup) return;
    dispatch({ type: "placeShip", row, col } satisfies BattleshipFullAction);
  }

  function handleFireSalvo() {
    if (!isPlaying) return;
    if (state.pendingShots.length !== aliveShips) return;
    dispatch({ type: "fireSalvo" } satisfies BattleshipFullAction);
  }

  // Status text
  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) {
    statusText = "Victory! Enemy fleet destroyed.";
    statusClass = "win";
  } else if (state.winner === 1) {
    statusText = "Defeat — your fleet was sunk.";
    statusClass = "loss";
  } else if (isSetup) {
    statusText = currentShip
      ? `Place your ${currentShip.name} (size ${currentShip.size}) — ${
          state.setupHorizontal ? "horizontal" : "vertical"
        }`
      : "Fleet placed — starting game...";
  } else {
    if (mode === "sonar") {
      statusText = "Sonar Ping: click a cell to reveal a 3×3 area.";
    } else if (mode === "fighter") {
      statusText = "Fighter Jet: click a cell to launch a free wildcard shot.";
    } else {
      const need = aliveShips - state.pendingShots.length;
      statusText =
        need > 0
          ? `Salvo: queue ${need} more shot${need === 1 ? "" : "s"} (${aliveShips} ships afloat).`
          : "Salvo ready — press Fire All to launch.";
    }
  }

  // Last salvo log summary
  const lastShotsCombined = [
    ...state.lastPlayerShots.map((s) => ({ ...s, who: "You" as const })),
    ...state.lastBotShots.map((s) => ({ ...s, who: "CPU" as const })),
  ];

  return (
    <div className="bsf fade-in">
      <div className={`bsf-status ${statusClass}`} data-testid="status">
        {statusText}
      </div>

      {isSetup && (
        <div className="bsf-setup">
          <div className="bsf-ship-list">
            {SHIPS.map((ship, i) => (
              <div
                key={ship.name}
                className={`bsf-ship-item ${
                  i === state.setupShipIndex
                    ? "current"
                    : i < state.setupShipIndex
                      ? "placed"
                      : ""
                }`}
              >
                <span>{ship.name}</span>
                <span className="bsf-ship-blocks">
                  {"█".repeat(ship.size)}
                </span>
              </div>
            ))}
          </div>
          <div className="bsf-actions">
            <button
              className="bsf-btn secondary"
              onClick={() =>
                dispatch({ type: "rotateShip" } satisfies BattleshipFullAction)
              }
              title="Toggle ship orientation between horizontal and vertical"
              data-testid="rotate"
            >
              Rotate ({state.setupHorizontal ? "H" : "V"})
            </button>
            <button
              className="bsf-btn primary"
              onClick={() =>
                dispatch({ type: "autoPlace" } satisfies BattleshipFullAction)
              }
              title="Place the entire fleet randomly using the no-touch rule"
              data-testid="auto-place"
            >
              Auto-Place Fleet
            </button>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="bsf-actions bsf-abilities">
          <button
            className={`bsf-btn ${mode === "salvo" ? "primary" : "secondary"}`}
            onClick={() => setMode("salvo")}
            title="Default mode: click enemy cells to queue salvo shots"
            data-testid="mode-salvo"
          >
            Salvo Mode
          </button>
          <button
            className={`bsf-btn ${mode === "sonar" ? "primary" : "secondary"}`}
            onClick={() => setMode(mode === "sonar" ? "salvo" : "sonar")}
            disabled={state.sonarUsed}
            title="Sonar Ping (1 use): reveal ship cells in a 3x3 area"
            data-testid="mode-sonar"
          >
            Sonar Ping {state.sonarUsed ? "(used)" : "(1)"}
          </button>
          <button
            className={`bsf-btn ${mode === "fighter" ? "primary" : "secondary"}`}
            onClick={() => setMode(mode === "fighter" ? "salvo" : "fighter")}
            disabled={state.fighterUsed}
            title="Fighter Jet (1 use): free wildcard single shot"
            data-testid="mode-fighter"
          >
            Fighter Jet {state.fighterUsed ? "(used)" : "(1)"}
          </button>
          <button
            className="bsf-btn primary"
            onClick={handleFireSalvo}
            disabled={state.pendingShots.length !== aliveShips || aliveShips === 0}
            title="Launch all queued salvo shots at once"
            data-testid="fire-salvo"
          >
            Fire All ({state.pendingShots.length}/{aliveShips})
          </button>
          <button
            className="bsf-btn secondary"
            onClick={() =>
              dispatch({ type: "clearShots" } satisfies BattleshipFullAction)
            }
            disabled={state.pendingShots.length === 0}
            title="Clear all queued salvo shots"
            data-testid="clear-shots"
          >
            Clear
          </button>
        </div>
      )}

      <div className="bsf-grids">
        {/* Player grid */}
        <div className="bsf-grid-wrap">
          <div className="bsf-grid-label">Your Fleet</div>
          <div
            className="bsf-grid"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 28px)` }}
          >
            {coordArray().map(({ row, col }) => {
              const cell = state.playerGrid.get({ row, col });
              const wasShot = state.lastBotShots.some(
                (s) => s.coord.row === row && s.coord.col === col,
              );
              return (
                <div
                  key={`p-${row}-${col}`}
                  className={`bsf-cell ${cell} ${wasShot ? "last-shot" : ""}`}
                  onClick={() => handlePlayerGridClick(row, col)}
                  data-testid={`player-${row}-${col}`}
                  title={`Row ${row + 1}, Col ${col + 1}: ${cell}`}
                >
                  {cell === "hit" ? "✕" : cell === "miss" ? "·" : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Enemy grid */}
        <div className="bsf-grid-wrap">
          <div className="bsf-grid-label">Enemy Waters</div>
          <div
            className="bsf-grid"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 28px)` }}
          >
            {coordArray().map(({ row, col }) => {
              const cell = state.enemyGrid.get({ row, col });
              const isQueued = pendingSet.has(`${row},${col}`);
              const wasShot = state.lastPlayerShots.some(
                (s) => s.coord.row === row && s.coord.col === col,
              );
              const clickable =
                isPlaying && state.winner === null && (cell === "unknown" || cell === "sonar");
              return (
                <div
                  key={`e-${row}-${col}`}
                  className={`bsf-cell ${cell} ${clickable ? "clickable" : ""} ${
                    isQueued ? "queued" : ""
                  } ${wasShot ? "last-shot" : ""} ${mode !== "salvo" && clickable ? `mode-${mode}` : ""}`}
                  onClick={() => handleEnemyClick(row, col)}
                  data-testid={`enemy-${row}-${col}`}
                  title={`Row ${row + 1}, Col ${col + 1}`}
                >
                  {cell === "hit"
                    ? "✕"
                    : cell === "miss"
                      ? "·"
                      : cell === "sonar"
                        ? "◉"
                        : isQueued
                          ? "⊙"
                          : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bsf-info-row">
        <div className="bsf-score-info pulse" data-testid="score-info">
          Enemy ships afloat: {enemyAlive} / {SHIPS.length}
        </div>
        <div className="bsf-score-info">
          Your ships afloat: {aliveShips} / {SHIPS.length}
        </div>
      </div>

      {lastShotsCombined.length > 0 && (
        <div className="bsf-log" data-testid="log">
          {state.lastPlayerShots.length > 0 && (
            <div className="bsf-log-line">
              <strong>You:</strong>{" "}
              {state.lastPlayerShots
                .map(
                  (s) =>
                    `${String.fromCharCode(65 + s.coord.col)}${s.coord.row + 1}=${
                      s.hit ? (s.sunk ? `SUNK ${s.sunk}` : "HIT") : "miss"
                    }`,
                )
                .join(", ")}
            </div>
          )}
          {state.lastBotShots.length > 0 && (
            <div className="bsf-log-line">
              <strong>CPU:</strong>{" "}
              {state.lastBotShots
                .map(
                  (s) =>
                    `${String.fromCharCode(65 + s.coord.col)}${s.coord.row + 1}=${
                      s.hit ? (s.sunk ? `SUNK ${s.sunk}` : "HIT") : "miss"
                    }`,
                )
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {terminal && (
        <div className={`bsf-end-panel bounce-in ${statusClass}`} data-testid="end-panel">
          <div className="bsf-end-title">
            {state.winner === 0 ? "Victory" : "Defeat"}
          </div>
          <div className="bsf-end-score">Score: {terminal.score}</div>
        </div>
      )}
    </div>
  );
}
