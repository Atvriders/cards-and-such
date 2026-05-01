import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BananagramsState, BananagramsAction, BananagramsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Bananagrams.css";

const GRID_SIZE = 15; // display a 15×15 grid centered at 0,0
const GRID_OFFSET = 7; // so index 7 = row/col 0

export function Bananagrams({
  state,
  dispatch,
  onGameOver,
}: GameProps<BananagramsState, BananagramsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "tick" } as BananagramsAction), 1000);
    return () => clearInterval(id);
  }, [state.gameOver, dispatch]);

  const { tiles, placed, hand, selectedHandTile, timeLeft, score, message, validationResult } = state;

  // Build grid lookup
  const gridMap = new Map<string, { id: number; letter: string }>();
  for (const t of placed) {
    gridMap.set(`${t.row},${t.col}`, { id: t.id, letter: t.letter });
  }

  function handleGridClick(row: number, col: number): void {
    const key = `${row},${col}`;
    const existing = gridMap.get(key);
    if (existing) {
      // Pick up tile
      dispatch({ type: "pickUpTile", tileId: existing.id } as BananagramsAction);
    } else if (selectedHandTile !== null) {
      dispatch({ type: "placeOnGrid", row, col } as BananagramsAction);
    }
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bng-wrap">
      <div className="bng-header">
        <span className="bng-score">Score: {score}</span>
        <span className="bng-timer">{mins}:{secs.toString().padStart(2,"0")}</span>
        <span className="bng-hand-count">Hand: {hand.length}</span>
      </div>

      <div className={`bng-message${validationResult === "valid" ? " bng-valid" : validationResult === "invalid" ? " bng-invalid" : ""}`}>
        {message}
      </div>

      {/* Grid */}
      <div className="bng-grid-scroll">
        <div className="bng-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 32px)` }}>
          {Array.from({ length: GRID_SIZE }, (_, gi) => {
            const row = gi - GRID_OFFSET;
            return Array.from({ length: GRID_SIZE }, (_, ci) => {
              const col = ci - GRID_OFFSET;
              const cell = gridMap.get(`${row},${col}`);
              return (
                <div
                  key={`${gi}-${ci}`}
                  className={`bng-cell${cell ? " bng-cell-placed" : " bng-cell-empty"}${selectedHandTile !== null && !cell ? " bng-cell-target" : ""}`}
                  onClick={() => handleGridClick(row, col)}
                >
                  {cell?.letter ?? ""}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Hand */}
      <div className="bng-hand">
        <div className="bng-hand-label">Your tiles:</div>
        <div className="bng-hand-tiles">
          {hand.map(id => (
            <div
              key={id}
              className={`bng-tile${selectedHandTile === id ? " bng-tile-selected" : ""}`}
              onClick={() => dispatch({ type: "selectHandTile", tileId: id } as BananagramsAction)}
            >
              {tiles[id]}
            </div>
          ))}
        </div>
      </div>

      <div className="bng-controls">
        <button onClick={() => dispatch({ type: "validate" } as BananagramsAction)}>Validate</button>
      </div>

      {state.gameOver && (
        <div className="bng-overlay">
          <div className="bng-overlay-box">
            <h2>{state.hand.length === 0 ? "Done!" : "Time's Up!"}</h2>
            <div>Tiles placed: {placed.length}</div>
            <div>Score: {score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
