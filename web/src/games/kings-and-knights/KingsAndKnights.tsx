import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KKState, KKSettings } from "./state.js";
import type { KKAction } from "./state.js";
import { isTerminal, allPieces, computeConflicts } from "./state.js";
import "./KingsAndKnights.css";

const PIECE_ICON: Record<string, string> = { K: "♚", N: "♞" };

export function KingsAndKnights({ state, dispatch, onGameOver }: GameProps<KKState, KKSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, selectedType, won } = state;
  const pieces = allPieces(state);
  const conflicts = computeConflicts(pieces);
  const clueKeys = new Set(puzzle.clues.map(p => `${p.row},${p.col}`));

  const kingsPlaced = pieces.filter(p => p.type === "K").length;
  const knightsPlaced = pieces.filter(p => p.type === "N").length;

  return (
    <div className="kk">
      <div className="kk-title">Kings and Knights</div>
      <div className={`kk-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Place ${puzzle.kingsCount} kings and ${puzzle.knightsCount} knights so none attack each other.`}
      </div>
      <div className="kk-info">
        Kings: {kingsPlaced}/{puzzle.kingsCount} &nbsp; Knights: {knightsPlaced}/{puzzle.knightsCount} &nbsp; Moves: {state.moves}
      </div>

      <div className="kk-toolbar">
        <span>Place:</span>
        {(["K", "N"] as const).map(t => (
          <button
            key={t}
            className={selectedType === t ? "active" : ""}
            onClick={() => dispatch({ type: "selectType", pieceType: t } satisfies KKAction)}
          >
            {PIECE_ICON[t]} {t === "K" ? "King" : "Knight"}
          </button>
        ))}
      </div>

      <div className="kk-board" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 48px)` }}>
        {Array.from({ length: puzzle.size * puzzle.size }, (_, idx) => {
          const row = Math.floor(idx / puzzle.size);
          const col = idx % puzzle.size;
          const key = `${row},${col}`;
          const piece = pieces.find(p => p.row === row && p.col === col);
          const isClue = clueKeys.has(key);
          const isConflict = conflicts.has(key);
          const shade = (row + col) % 2 === 0 ? "light" : "dark";
          const cls = ["kk-cell", shade, isClue ? "clue" : "", isConflict ? "conflict" : ""].filter(Boolean).join(" ");
          return (
            <div
              key={idx}
              className={cls}
              onClick={() => !won && dispatch({ type: "toggleCell", row, col } satisfies KKAction)}
            >
              {piece ? PIECE_ICON[piece.type] : ""}
            </div>
          );
        })}
      </div>

      <div className="kk-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
