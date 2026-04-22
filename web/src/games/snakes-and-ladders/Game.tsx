import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnakesState, SnakesSettings } from "./state.js";
import type { SnakesAction } from "./state.js";
import { isTerminal, BOARD_SIZE, FIXED_SNAKES_LADDERS } from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

// Build a 10x10 board. Row 0 = top (squares 91-100), Row 9 = bottom (squares 1-10)
// Alternating snake pattern: row 9 goes left->right (1-10), row 8 right->left (11-20), etc.
function squareAt(row: number, col: number): number {
  const rowFromBottom = 9 - row;
  if (rowFromBottom % 2 === 0) {
    // left to right
    return rowFromBottom * 10 + col + 1;
  } else {
    // right to left
    return rowFromBottom * 10 + (9 - col) + 1;
  }
}

function posToRowCol(pos: number): { row: number; col: number } {
  if (pos === 0) return { row: 9, col: -1 }; // off-board start
  const zero = pos - 1; // 0-based
  const rowFromBottom = Math.floor(zero / 10);
  const rowFromBottom_even = rowFromBottom % 2 === 0;
  const col = rowFromBottom_even ? zero % 10 : 9 - (zero % 10);
  const row = 9 - rowFromBottom;
  return { row, col };
}

export function SnakesAndLadders({
  state,
  dispatch,
  onGameOver,
}: GameProps<SnakesState, SnakesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canRoll = isMyTurn && state.phase === "rolling";

  let status = "";
  if (state.winner === 0) status = "You win! 🎉";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is rolling…`;
  else status = "Roll the die!";

  // Build snake/ladder sets for rendering
  const ladderFroms = new Set(FIXED_SNAKES_LADDERS.filter((x) => x.type === "ladder").map((x) => x.from));
  const ladderTos = new Set(FIXED_SNAKES_LADDERS.filter((x) => x.type === "ladder").map((x) => x.to));
  const snakeFroms = new Set(FIXED_SNAKES_LADDERS.filter((x) => x.type === "snake").map((x) => x.from));
  const snakeTos = new Set(FIXED_SNAKES_LADDERS.filter((x) => x.type === "snake").map((x) => x.to));

  return (
    <div className="snl-game">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      {state.lastTeleport && (
        <div className={`teleport-msg ${state.lastTeleport.type}`}>
          {LABELS[state.lastTeleport.player]}: {state.lastTeleport.type === "ladder" ? "🪜 Ladder!" : "🐍 Snake!"}{" "}
          {state.lastTeleport.from} → {state.lastTeleport.to}
        </div>
      )}

      <div className="snl-die-row">
        {state.die > 0 && <div className="die-face">{state.die}</div>}
        {canRoll && (
          <button className="roll-btn" onClick={() => dispatch({ type: "roll" } satisfies SnakesAction)}>
            Roll Die
          </button>
        )}
      </div>

      {/* Player positions */}
      <div className="snl-positions">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div key={pi} className={`snl-player color-${COLORS[pi]}`}>
            <span className="player-dot"></span>
            <span>{LABELS[pi]}: {state.positions[pi] === 0 ? "Start" : state.positions[pi] === BOARD_SIZE ? "Finished!" : `Sq ${state.positions[pi]}`}</span>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="snl-board">
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => {
            const sq = squareAt(row, col);
            const playersHere = Array.from({ length: state.numPlayers }, (_, pi) =>
              state.positions[pi] === sq ? pi : -1
            ).filter((pi) => pi !== -1);
            const isLadderFrom = ladderFroms.has(sq);
            const isLadderTo = ladderTos.has(sq);
            const isSnakeFrom = snakeFroms.has(sq);
            const isSnakeTo = snakeTos.has(sq);
            let cellClass = "snl-cell";
            if (isLadderFrom) cellClass += " ladder-from";
            if (isLadderTo) cellClass += " ladder-to";
            if (isSnakeFrom) cellClass += " snake-from";
            if (isSnakeTo) cellClass += " snake-to";
            return (
              <div key={`${row}-${col}`} className={cellClass} title={`Square ${sq}`}>
                <span className="sq-num">{sq}</span>
                {isLadderFrom && <span className="cell-icon">🪜</span>}
                {isSnakeFrom && <span className="cell-icon">🐍</span>}
                <div className="cell-tokens">
                  {playersHere.map((pi) => (
                    <span key={pi} className={`cell-token color-${COLORS[pi] ?? "blue"}`}>{(LABELS[pi] ?? "?")[0]}</span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
