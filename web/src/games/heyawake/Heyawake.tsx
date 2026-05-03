import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HeyawakeState, HeyawakeSettings, HeyawakeAction, CellMark } from "./state.js";
import { isTerminal, countShadedInRoom } from "./state.js";
import "./Heyawake.css";

const CELL = 44;

export function Heyawake({ state, dispatch, onGameOver }: GameProps<HeyawakeState, HeyawakeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, board, won } = state;
  const { size, rooms } = puzzle;

  // Build room index per cell for border styling
  const cellRoom = new Array(size * size).fill(-1);
  rooms.forEach((room, ri) => {
    for (let r = room.r; r < room.r + room.h; r++)
      for (let c = room.c; c < room.c + room.w; c++)
        cellRoom[r * size + c] = ri;
  });

  return (
    <div className="heyawake">
      <div className="heyawake-title">Heyawake</div>
      <div className={`heyawake-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — shade cells to match room counts`}
      </div>

      <div className="heyawake-wrap">
        <div className="heyawake-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
          {Array.from({ length: size * size }, (_, idx) => {
            const r = Math.floor(idx / size), c = idx % size;
            const ri = cellRoom[idx]!;
            const room = ri >= 0 ? rooms[ri]! : null;
            const mark = board[idx] as CellMark;

            // Border: thick on room boundaries
            const borderTop = room && r === room.r ? "2px solid #333" : "1px solid #ccc";
            const borderLeft = room && c === room.c ? "2px solid #333" : "1px solid #ccc";
            const borderBottom = room && r === room.r + room.h - 1 ? "2px solid #333" : "1px solid #ccc";
            const borderRight = room && c === room.c + room.w - 1 ? "2px solid #333" : "1px solid #ccc";

            return (
              <div
                key={idx}
                className={`heyawake-cell ${mark}`}
                style={{ width: CELL, height: CELL, borderTop, borderLeft, borderBottom, borderRight }}
                onClick={() => !won && dispatch({ type: "clickCell", idx } satisfies HeyawakeAction)}
              >
                {mark === "dot" ? "·" : ""}
              </div>
            );
          })}
        </div>

        {/* Room clue labels */}
        <div className="heyawake-clues" style={{ position: "relative" }}>
          {rooms.map((room, ri) => {
            if (room.clue === null) return null;
            const count = countShadedInRoom(board, puzzle, ri);
            const ok = count === room.clue;
            return (
              <div
                key={ri}
                className={`heyawake-room-clue${ok ? " ok" : ""}`}
                style={{
                  position: "absolute",
                  top: room.r * CELL + 2,
                  left: room.c * CELL + 2,
                  fontSize: "0.75rem",
                }}
              >
                {room.clue}
              </div>
            );
          })}
        </div>
      </div>

      <div className="heyawake-btns">
        <button data-testid="hint-target-heyawake-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
      <div className="heyawake-hint">Click: empty → shaded → dot → empty</div>
    </div>
  );
}
